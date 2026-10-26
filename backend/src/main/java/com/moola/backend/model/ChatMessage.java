package com.moola.backend.model;

public class ChatMessage {
    private String id;
    private String conversationId;
    private String senderId;
    private String senderName;
    private String content;
    private String timestamp;
    private Boolean read;

    public ChatMessage() {}

    public ChatMessage(String id, String conversationId, String senderId, String senderName, String content, String timestamp, Boolean read) {
        this.id = id;
        this.conversationId = conversationId;
        this.senderId = senderId;
        this.senderName = senderName;
        this.content = content;
        this.timestamp = timestamp;
        this.read = read;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getConversationId() { return conversationId; }
    public void setConversationId(String conversationId) { this.conversationId = conversationId; }
    public String getSenderId() { return senderId; }
    public void setSenderId(String senderId) { this.senderId = senderId; }
    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    public Boolean getRead() { return read; }
    public void setRead(Boolean read) { this.read = read; }
}
