package com.edumind.backend.service;

import java.awt.image.BufferedImage;
import java.io.IOException;

import javax.imageio.ImageIO;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;

@Service
public class TextExtractionService {

    // For scanned PDFs — render each page as image then OCR it
    public String extractFromPdf(MultipartFile file) throws IOException {
        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            PDFRenderer renderer = new PDFRenderer(document);
            Tesseract tesseract = new Tesseract();
            tesseract.setDatapath("C:\\Program Files\\Tesseract-OCR\\tessdata");
            tesseract.setLanguage("eng");

            StringBuilder fullText = new StringBuilder();

            for (int page = 0; page < document.getNumberOfPages(); page++) {
                // Render each page as image at 300 DPI for better OCR accuracy
                BufferedImage image = renderer.renderImageWithDPI(page, 300);
                try {
                    String pageText = tesseract.doOCR(image);
                    fullText.append(pageText).append("\n");
                    System.out.println("Page " + (page + 1) + " extracted: " + pageText.length() + " chars");
                } catch (TesseractException e) {
                    System.out.println("OCR failed on page " + (page + 1) + ": " + e.getMessage());
                }
            }

            return fullText.toString().trim();

        } catch (Exception e) {
            System.out.println("PDF extraction error: " + e.getMessage());
            return "";
        }
    }

    public String extractFromImage(MultipartFile file) throws IOException {
        try {
            Tesseract tesseract = new Tesseract();
            tesseract.setDatapath("C:\\Program Files\\Tesseract-OCR\\tessdata");
            tesseract.setLanguage("eng");
            BufferedImage image = ImageIO.read(file.getInputStream());
            return tesseract.doOCR(image).trim();
        } catch (TesseractException e) {
            return "";
        }
    }

    public String extractText(MultipartFile file) throws IOException {
        String contentType = file.getContentType();
        if (contentType != null && contentType.equals("application/pdf")) {
            return extractFromPdf(file);
        } else if (contentType != null && contentType.startsWith("image/")) {
            return extractFromImage(file);
        }
        return "";
    }
}