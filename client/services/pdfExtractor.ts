// Simple PDF text extraction service
export class PDFExtractor {
  static async extractText(file: File): Promise<string> {
    try {
      // For now, we'll use a simple approach that works with most text-based PDFs
      // This is a basic implementation that attempts to read PDF as text
      
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const textDecoder = new TextDecoder('utf-8');
      
      // Try to decode as UTF-8 and look for text content
      let rawText = textDecoder.decode(uint8Array);
      
      // Simple PDF text extraction - look for text between common PDF text markers
      const textMatches = rawText.match(/\((.*?)\)/g) || [];
      const extractedText = textMatches
        .map(match => match.replace(/[()]/g, ''))
        .filter(text => text.length > 2 && /[a-zA-Z]/.test(text))
        .join(' ');
      
      if (extractedText.length > 50) {
        return extractedText;
      }
      
      // Fallback: try to find text streams in PDF
      const streamMatches = rawText.match(/stream\s*(.*?)\s*endstream/gs);
      if (streamMatches) {
        const streamText = streamMatches
          .map(stream => {
            // Remove PDF commands and extract readable text
            return stream
              .replace(/stream|endstream/g, '')
              .replace(/[<>]/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();
          })
          .filter(text => text.length > 10 && /[a-zA-Z]/.test(text))
          .join(' ');
          
        if (streamText.length > 50) {
          return streamText;
        }
      }
      
      return "This PDF appears to be image-based or uses complex formatting that prevents text extraction. Please try copying and pasting the text content manually, or use a PDF that contains selectable text.";
      
    } catch (error) {
      console.error("PDF text extraction error:", error);
      return "Unable to extract text from this PDF file. The file might be corrupted, password-protected, or image-based. Please try uploading a different PDF or copying the text content manually.";
    }
  }
  
  static async isTextBasedPDF(file: File): Promise<boolean> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const textDecoder = new TextDecoder('utf-8');
      const content = textDecoder.decode(uint8Array.slice(0, 1024)); // Check first 1KB
      
      // Look for PDF text indicators
      return content.includes('PDF') && (
        content.includes('stream') || 
        content.includes('BT') || 
        content.includes('Tj') ||
        content.includes('TJ')
      );
    } catch {
      return false;
    }
  }
}
