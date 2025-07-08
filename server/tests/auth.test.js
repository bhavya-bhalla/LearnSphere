const request = require("supertest");
const express = require("express");
const app = require("../server"); // make sure this exports the app object

describe("POST /api/auth/login", () => {
  it("should log in as instructor with correct credentials", async () => {
    const res = await request("http://localhost:5000")
      .post("/api/auth/login")
      .send({
        email: "sarah.johnson@learnsphere.com",
        password: "password123",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token"); // Assuming your response includes a JWT token
  });

  it("should fail login with incorrect password", async () => {
    const res = await request("http://localhost:5000")
      .post("/api/auth/login")
      .send({
        email: "sarah.johnson@learnsphere.com",
        password: "wrongpassword",
      });

    expect(res.statusCode).toBe(401);
  });
});
