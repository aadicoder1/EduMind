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
public class GeminiService {

    @Value("${groq.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final Gson gson = new Gson();

    private static final String GROQ_URL =
        "https://api.groq.com/openai/v1/chat/completions";

    // Core method — sends prompt to Groq and returns response
    public String generate(String prompt) {

        // Build message in OpenAI format which Groq uses
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

        // Parse Groq response
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
            """ + noteText;
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
            """ + noteText;
        return generate(prompt);
    }

    public String chat(String noteText, String question) {
        String prompt = """
            You are a study assistant. Answer the following question
            based ONLY on the provided notes. If the answer is not
            in the notes, say "This topic is not covered in your notes."
            Keep the answer clear and concise.
            
            Notes:
            """ + noteText + """
            
            Question:
            """ + question;
        return generate(prompt);
    }
}