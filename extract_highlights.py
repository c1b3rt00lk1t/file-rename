import fitz
import sys
import os

def extract_highlights_simple(pdf_path):
    """
    Simple function to extract highlighted text from PDF
    """
    doc = fitz.open(pdf_path)
    highlights = []
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        
        # Get all annotations on the page
        annot = page.first_annot
        while annot:
            print(f"Found annotation type: {annot.type}")  # Debug info
            
            if annot.type[1] == "Highlight":  # Check if it's a highlight annotation
                # Get the highlighted text
                highlight_text = ""
                
                # Method 1: Try to get text from annotation content
                if annot.info.get("content"):
                    highlight_text = annot.info["content"]
                else:
                    # Method 2: Extract text from the highlighted area
                    rect = annot.rect
                    highlight_text = page.get_textbox(rect)
                
                if highlight_text.strip():
                    highlights.append({
                        "page": page_num + 1,
                        "text": highlight_text.strip()
                    })
                    print(f"Found highlight: {highlight_text.strip()}")  # Debug info
            
            annot = annot.next
    
    doc.close()
    return highlights

def main():
    if len(sys.argv) < 2:
        print("Usage: python extract_highlights.py <pdf_file>")
        return
    
    pdf_file = sys.argv[1]
    
    # Check if file exists
    if not os.path.exists(pdf_file):
        print(f"Error: File '{pdf_file}' not found")
        return
    
    try:
        print(f"Processing: {pdf_file}")
        highlights = extract_highlights_simple(pdf_file)
        
        if highlights:
            print(f"\nExtracted {len(highlights)} highlights:")
            for i, highlight in enumerate(highlights, 1):
                print(f"{i}. Page {highlight['page']}: {highlight['text']}")
        else:
            print("No highlights found in the PDF")
            
    except Exception as e:
        print(f"Error processing PDF: {str(e)}")

if __name__ == "__main__":
    main()