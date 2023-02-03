import app, { init } from "@/app";
import httpStatus from "http-status";
import supertest from "supertest";
import { createEnrollmentWithAddress, createHotel, createTicket, createTicketType, createUser } from "../factories";
import { cleanDb, generateValidToken } from "../helpers";
import { TicketStatus } from "@prisma/client";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /hotels", () => {
  it("Should respond with status 402 if user don't paid", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType();

    await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
    expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
  });

  it("Should respond with status 402 if ticket is remote", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(false);

    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
    expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
  });

  it("should respond with status 402 if ticket has no hotel included", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enroll = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(true, true);

    await createTicket(enroll.id, ticketType.id, TicketStatus.PAID);

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
  });

  it("Should respond with status 200 and hotels data", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(true, false);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const hotel = await createHotel();

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
    expect(response.status).toEqual(httpStatus.OK);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: hotel.id,
          name: hotel.name,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      ]),
    );
  });
});
