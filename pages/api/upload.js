import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Disable body parser for this route
export const config = {
  api: {
    bodyParser: false,
  },
};

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Handling file upload request');
    
    // Parse the incoming form data
    const form = new IncomingForm({
      uploadDir: uploadDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
    });
    
    // Process the file upload
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });
    
    // Get the uploaded file - handle both array and single object formats
    let file = files.photo;
    
    // Check if file is an array and extract the first element
    if (Array.isArray(file)) {
      console.log('File is an array, extracting first element');
      file = file[0];
    }
    
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Log file structure to debug
    console.log('File object structure:', JSON.stringify(file, null, 2));
    
    try {
      // Generate a unique filename using UUID for better uniqueness
      const fileExt = path.extname(file.originalFilename || 'image.jpg');
      const fileName = `${Date.now()}-${uuidv4()}${fileExt}`;
      
      // Move the file to the uploads directory with the new name
      // Formidable v4 uses filepath, but older versions might use path
      const oldPath = file.filepath || file.path;
      
      if (!oldPath) {
        throw new Error('Impossible de déterminer le chemin du fichier temporaire');
      }
      
      const newPath = path.join(uploadDir, fileName);
      
      // Use fs.copyFile instead of rename to avoid issues across devices
      await fs.promises.copyFile(oldPath, newPath);
      await fs.promises.unlink(oldPath); // Delete the temp file after copying
    
      // Generate the public URL for the file
      const fileUrl = `/uploads/${fileName}`;
      console.log('File uploaded successfully:', fileUrl);
      
      return res.status(200).json({
        url: fileUrl,
        success: true,
      });
    } catch (copyError) {
      console.error('File processing error:', copyError);
      return res.status(500).json({ 
        message: 'Error processing uploaded file', 
        error: copyError.message 
      });
    }
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      message: 'File upload failed', 
      error: error.message
    });
  }
}