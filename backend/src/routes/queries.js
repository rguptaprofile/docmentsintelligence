const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Mock LLM processing functions
const parseQuery = async (queryText) => {
  // Simulate LLM parsing
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const text = queryText.toLowerCase();
  const parsed = {
    age: null,
    gender: null,
    procedure: null,
    location: null,
    policyDuration: null,
    entities: {}
  };

  // Extract age
  const ageMatch = text.match(/(\d+)[-\s]*(year|yr|y|m|male|female|f)/i);
  if (ageMatch) {
    parsed.age = parseInt(ageMatch[1]);
    parsed.gender = text.includes('female') || text.includes('f') ? 'female' : 'male';
  }

  // Extract procedure
  const procedures = ['knee surgery', 'heart surgery', 'eye surgery', 'dental', 'surgery'];
  for (const procedure of procedures) {
    if (text.includes(procedure)) {
      parsed.procedure = procedure;
      break;
    }
  }

  // Extract location
  const locations = ['pune', 'mumbai', 'delhi', 'bangalore', 'chennai', 'kolkata'];
  for (const location of locations) {
    if (text.includes(location)) {
      parsed.location = location;
      break;
    }
  }

  // Extract policy duration
  const durationMatch = text.match(/(\d+)[-\s]*(month|year|day)/i);
  if (durationMatch) {
    parsed.policyDuration = `${durationMatch[1]} ${durationMatch[2]}`;
  }

  return parsed;
};

const findRelevantClauses = async (parsedQuery, userId) => {
  // Get user's documents and their clauses
  const documents = await prisma.document.findMany({
    where: {
      userId: userId,
      status: 'ready'
    },
    include: {
      clauses: true
    }
  });

  const relevantClauses = [];

  for (const doc of documents) {
    for (const clause of doc.clauses) {
      let relevanceScore = 0;

      // Simple keyword matching (in real implementation, use vector similarity)
      if (parsedQuery.procedure && clause.text.toLowerCase().includes(parsedQuery.procedure)) {
        relevanceScore += 0.4;
      }

      if (parsedQuery.age && clause.text.toLowerCase().includes('age')) {
        relevanceScore += 0.2;
      }

      if (parsedQuery.location && clause.text.toLowerCase().includes(parsedQuery.location)) {
        relevanceScore += 0.2;
      }

      if (parsedQuery.policyDuration && clause.text.toLowerCase().includes('month')) {
        relevanceScore += 0.2;
      }

      if (relevanceScore > 0.1) {
        relevantClauses.push({
          ...clause,
          documentName: doc.name,
          relevanceScore
        });
      }
    }
  }

  return relevantClauses.sort((a, b) => b.relevanceScore - a.relevanceScore);
};

const makeDecision = async (parsedQuery, clauses) => {
  await new Promise(resolve => setTimeout(resolve, 800));

  let decision = 'pending';
  let amount = null;
  let justification = 'Unable to determine coverage based on available information.';
  let confidence = 0.5;

  if (clauses.length > 0) {
    // Decision logic based on parsed query and clauses
    if (parsedQuery.procedure === 'knee surgery') {
      if (parsedQuery.policyDuration?.includes('3 month') || 
          (parsedQuery.policyDuration && parseInt(parsedQuery.policyDuration) >= 3)) {
        decision = 'approved';
        amount = 500000;
        justification = 'Knee surgery is covered under the policy. Patient meets the 90-day waiting period requirement.';
        confidence = 0.92;
      } else {
        decision = 'rejected';
        justification = 'Claim rejected due to insufficient policy duration. Minimum 90 days required for surgical procedures.';
        confidence = 0.88;
      }
    }

    // Age check
    if (parsedQuery.age && parsedQuery.age > 65) {
      decision = 'requires_review';
      justification += ' Age exceeds standard coverage limits - manual review required.';
      confidence = Math.max(0.6, confidence - 0.2);
    }

    // Location check
    if (parsedQuery.location && ['pune', 'mumbai', 'delhi'].includes(parsedQuery.location)) {
      if (decision === 'approved') {
        justification += ' Treatment location is within network coverage area.';
      }
    }
  }

  return {
    decision,
    amount,
    currency: amount ? 'INR' : null,
    justification,
    confidence,
    clauses: clauses.slice(0, 3) // Top 3 most relevant clauses
  };
};

// Process new query
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Query text is required' });
    }

    const startTime = Date.now();

    // Create query record
    const query = await prisma.query.create({
      data: {
        text: text.trim(),
        status: 'processing',
        userId: req.user.id
      }
    });

    // Process query in background
    setImmediate(async () => {
      try {
        const parsedQuery = await parseQuery(text);
        const clauses = await findRelevantClauses(parsedQuery, req.user.id);
        const decision = await makeDecision(parsedQuery, clauses);
        
        const processingTime = Date.now() - startTime;

        // Update query with results
        await prisma.query.update({
          where: { id: query.id },
          data: {
            status: 'completed',
            decision: decision.decision,
            amount: decision.amount,
            currency: decision.currency,
            justification: decision.justification,
            confidence: decision.confidence,
            processingTime: processingTime
          }
        });

        // Store query-clause relationships
        for (const clause of decision.clauses) {
          await prisma.queryResult.create({
            data: {
              queryId: query.id,
              clauseId: clause.id,
              relevanceScore: clause.relevanceScore
            }
          });
        }
      } catch (error) {
        console.error('Query processing error:', error);
        await prisma.query.update({
          where: { id: query.id },
          data: { status: 'error' }
        });
      }
    });

    res.status(201).json({
      message: 'Query submitted for processing',
      query: {
        id: query.id,
        text: query.text,
        timestamp: query.timestamp,
        status: query.status
      }
    });
  } catch (error) {
    console.error('Submit query error:', error);
    res.status(500).json({ error: 'Failed to process query' });
  }
});

// Get query history
router.get('/', authenticateToken, async (req, res) => {
  try {
    const queries = await prisma.query.findMany({
      where: { userId: req.user.id },
      include: {
        queryResults: {
          include: {
            clause: {
              include: {
                document: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { timestamp: 'desc' }
    });

    // Format response
    const formattedQueries = queries.map(query => ({
      id: query.id,
      text: query.text,
      timestamp: query.timestamp,
      status: query.status,
      decision: query.decision,
      amount: query.amount,
      currency: query.currency,
      justification: query.justification,
      confidence: query.confidence,
      processingTime: query.processingTime,
      clauses: query.queryResults.map(result => ({
        id: result.clause.id,
        text: result.clause.text,
        section: result.clause.section,
        page: result.clause.page,
        documentName: result.clause.document.name,
        relevanceScore: result.relevanceScore
      }))
    }));

    res.json({ queries: formattedQueries });
  } catch (error) {
    console.error('Get queries error:', error);
    res.status(500).json({ error: 'Failed to fetch queries' });
  }
});

// Get query by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const query = await prisma.query.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: {
        queryResults: {
          include: {
            clause: {
              include: {
                document: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!query) {
      return res.status(404).json({ error: 'Query not found' });
    }

    // Format response
    const formattedQuery = {
      id: query.id,
      text: query.text,
      timestamp: query.timestamp,
      status: query.status,
      decision: query.decision,
      amount: query.amount,
      currency: query.currency,
      justification: query.justification,
      confidence: query.confidence,
      processingTime: query.processingTime,
      clauses: query.queryResults.map(result => ({
        id: result.clause.id,
        text: result.clause.text,
        section: result.clause.section,
        page: result.clause.page,
        documentName: result.clause.document.name,
        relevanceScore: result.relevanceScore
      }))
    };

    res.json({ query: formattedQuery });
  } catch (error) {
    console.error('Get query error:', error);
    res.status(500).json({ error: 'Failed to fetch query' });
  }
});

module.exports = router;