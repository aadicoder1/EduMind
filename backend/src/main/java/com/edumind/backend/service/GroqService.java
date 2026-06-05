package com.edumind.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

@Service
public class GroqService {

    @Value("${groq.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final Gson gson = new Gson();

    private static final String GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
    private static final int MAX_TEXT_LENGTH = 3000;

    // Truncate rawText to avoid hitting Groq token limits
    private String truncate(String text) {
        if (text == null) return "";
        return text.length() > MAX_TEXT_LENGTH ? text.substring(0, MAX_TEXT_LENGTH) : text;
    }

    // Core method — sends prompt to Groq and returns response
    public String generate(String prompt) {

        JsonObject message = new JsonObject();
        message.addProperty("role", "user");
        message.addProperty("content", prompt);

        JsonArray messages = new JsonArray();
        messages.add(message);

        JsonObject requestBody = new JsonObject();
        requestBody.addProperty("model", "llama-3.3-70b-versatile");
        requestBody.add("messages", messages);
        requestBody.addProperty("max_tokens", 1024);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);

        HttpEntity<String> entity = new HttpEntity<>(gson.toJson(requestBody), headers);

        ResponseEntity<String> response = restTemplate.exchange(
            GROQ_URL, HttpMethod.POST, entity, String.class
        );

        JsonObject responseJson = gson.fromJson(response.getBody(), JsonObject.class);
        return responseJson
            .getAsJsonArray("choices")
            .get(0).getAsJsonObject()
            .getAsJsonObject("message")
            .get("content").getAsString();
    }

    public String summarize(String noteText) {
        String prompt = """
            You are a study assistant for university students.
            Summarize the following notes in a clear, concise way.
            Use bullet points. Focus on key concepts only.
            Keep it under 300 words.
            
            Notes:
            """ + truncate(noteText);
        return generate(prompt);
    }

    public String generateFlashcards(String noteText) {
        String prompt = """
            You are a study assistant for university students.
            Create 10 flashcards from the following notes.
            Format each flashcard exactly like this:
            Q: [question]
            A: [answer]
            
            Make questions clear and answers concise.
            
            Notes:
            """ + truncate(noteText);
        return generate(prompt);
    }

    public String chat(String noteText, String question) {
        String prompt = """
            You are a study assistant. Answer the following question
            based ONLY on the provided notes. If the answer is not
            in the notes, say "This topic is not covered in your notes."
            Keep the answer clear and concise.
            
            Notes:
            """ + truncate(noteText) + """
            
            Question:
            """ + question;
        return generate(prompt);
    }

public String chatWithContext(String noteText, String conversationHistory, String question) {
    String prompt = """
        You are a study assistant for a university student.
        Answer ONLY based on the notes provided below.
        If the topic is not covered in the notes, clearly say:
        "This topic is not covered in your notes."
        Then explain it anyway, but match the same style, tone and depth as the notes.

        --- NOTES ---
        """ + truncate(noteText) + """

        --- CONVERSATION SO FAR ---
        """ + conversationHistory + """

        --- STUDENT'S QUESTION ---
        """ + question;
    return generate(prompt);
}
}