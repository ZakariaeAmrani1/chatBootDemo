import { RequestHandler } from "express";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { DataManager } from "../utils/dataManager";
import { FileAttachment, ApiResponse } from "@shared/types";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'server/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const extension = path.extname(file.originalname);
    cb(null, `${uniqueId}${extension}`);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow common file types
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 
    'text/plain', 'text/csv',
    'application/json',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed'));
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload files
export const uploadFiles = [
  upload.array('files', 5), // Max 5 files
  (req: any, res: any) => {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        const response: ApiResponse<FileAttachment[]> = {
          success: false,
          error: 'No files uploaded'
        };
        return res.status(400).json(response);
      }
      
      const fileAttachments: FileAttachment[] = files.map(file => {
        const fileAttachment: FileAttachment = {
          id: uuidv4(),
          name: file.originalname,
          size: file.size,
          type: file.mimetype,
          url: `/api/files/${path.basename(file.filename)}`,
          uploadedAt: new Date().toISOString()
        };
        
        // Save to data store
        DataManager.addFile(fileAttachment);
        return fileAttachment;
      });
      
      const response: ApiResponse<FileAttachment[]> = {
        success: true,
        data: fileAttachments
      };
      
      res.json(response);
    } catch (error) {
      const response: ApiResponse<FileAttachment[]> = {
        success: false,
        error: 'Failed to upload files'
      };
      res.status(500).json(response);
    }
  }
] as RequestHandler[];

// Serve uploaded files
export const serveFile: RequestHandler = (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(process.cwd(), 'server/uploads', filename);
    
    res.sendFile(filePath, (err) => {
      if (err) {
        res.status(404).json({
          success: false,
          error: 'File not found'
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to serve file'
    });
  }
};

// Get file information
export const getFileInfo: RequestHandler = (req, res) => {
  try {
    const fileId = req.params.fileId;
    const file = DataManager.getFileById(fileId);
    
    if (!file) {
      const response: ApiResponse<FileAttachment> = {
        success: false,
        error: 'File not found'
      };
      return res.status(404).json(response);
    }
    
    const response: ApiResponse<FileAttachment> = {
      success: true,
      data: file
    };
    
    res.json(response);
  } catch (error) {
    const response: ApiResponse<FileAttachment> = {
      success: false,
      error: 'Failed to get file info'
    };
    res.status(500).json(response);
  }
};
