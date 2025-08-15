const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'));
    }
  }
});

// Mock content extraction function
const extractTextContent = async (filePath, mimeType) => {
  // In a real implementation, you would use libraries like:
  // - pdf-parse for PDFs
  // - mammoth for DOCX files
  // - fs.readFile for text files
  
  try {
    if (mimeType === 'text/plain') {
      const content = await fs.readFile(filePath, 'utf-8');
      return content;
    }
    
    // Mock content for other file types
    return `Extracted content from ${path.basename(filePath)}. This would contain the actual document text in a real implementation with proper text extraction libraries.`;
  } catch (error) {
    console.error('Content extraction error:', error);
    return null;
  }
};

// Upload document
router.post('/upload', authenticateToken, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Create document record
    const document = await prisma.document.create({
      data: {
        name: req.file.originalname,
        type: req.file.mimetype,
        size: req.file.size,
        filePath: req.file.path,
        status: 'processing',
        userId: req.user.id
      }
    });

    // Process document content in background
    setImmediate(async () => {
      try {
        const content = await extractTextContent(req.file.path, req.file.mimetype);
        
        await prisma.document.update({
          where: { id: document.id },
          data: {
            content: content,
            status: 'ready'
          }
        });

        // Extract and store clauses (simplified)
        if (content) {
          const clauses = content.split('\n\n').filter(clause => clause.trim().length > 50);
          
          for (let i = 0; i < clauses.length; i++) {
            await prisma.clause.create({
              data: {
                text: clauses[i].trim(),
                section: `Section ${i + 1}`,
                page: Math.floor(i / 3) + 1,
                documentId: document.id
              }
            });
          }
        }
      } catch (error) {
        console.error('Document processing error:', error);
        await prisma.document.update({
          where: { id: document.id },
          data: { status: 'error' }
        });
      }
    });

    res.status(201).json({
      message: 'Document uploaded successfully',
      document: {
        id: document.id,
        name: document.name,
        type: document.type,
        size: document.size,
        uploadedAt: document.uploadedAt,
        status: document.status
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Get user documents
router.get('/', authenticateToken, async (req, res) => {
  try {
    const documents = await prisma.document.findMany({
      where: { userId: req.user.id },
      select: {
        id: true,
        name: true,
        type: true,
        size: true,
        uploadedAt: true,
        status: true,
        content: true
      },
      orderBy: { uploadedAt: 'desc' }
    });

    res.json({ documents });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Get document by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const document = await prisma.document.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: {
        clauses: {
          select: {
            id: true,
            text: true,
            section: true,
            page: true
          }
        }
      }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({ document });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// Delete document
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const document = await prisma.document.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Delete file from filesystem
    if (document.filePath) {
      try {
        await fs.unlink(document.filePath);
      } catch (error) {
        console.error('File deletion error:', error);
      }
    }

    // Delete from database (cascades to clauses)
    await prisma.document.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

module.exports = router;