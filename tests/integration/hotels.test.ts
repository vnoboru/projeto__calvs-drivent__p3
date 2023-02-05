import app, { init } from "@/app";
import httpStatus from "http-status";
import supertest from "supertest";
import {
  createEnrollmentWithAddress,
  createHotel,
  createRoomHotel,
  createTicket,
  createTicketType,
  createUser,
} from "../factories";
import { cleanDb, generateValidToken } from "../helpers";
import { TicketStatus } from "@prisma/client";
import { faker } from "@faker-js/faker";
import * as jwt from "jsonwebtoken";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /hotels", () => {
  it("Should respond with status 401 if no provided token", async () => {
    const response = await server.get("/hotels");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/payments").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/enrollments").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

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

  it("Should respond with status 402 if ticket has no hotel included", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enroll = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(true, true);

    await createTicket(enroll.id, ticketType.id, TicketStatus.PAID);

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
  });

  it("Should respond with status 404 when user doesnt have a ticket", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    await createEnrollmentWithAddress(user);

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toEqual(httpStatus.NOT_FOUND);
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

  it("should respond with status 400 when there is no corresponding hotel for the given params", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(false, true);
    await createTicket(enrollment.id, ticketType.id, "PAID");

    const response = await server.get("/hotels/x").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.BAD_REQUEST);
  });

  it("should respond with status 400 when there is no corresponding hotel for the given params", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(false, true);
    await createTicket(enrollment.id, ticketType.id, "PAID");

    const response = await server.get("/hotels/x").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.BAD_REQUEST);
  });

  it("should respond with status 200 and hotel data including rooms rooms when there is enrollment and ticket paid for given user", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(true, false);
    await createTicket(enrollment.id, ticketType.id, "PAID");
    const hotel = await createHotel();
    const hotelWithRooms = await createRoomHotel(hotel.id);

    const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toEqual({
      id: hotel.id,
      name: hotel.name,
      image: hotel.image,
      createdAt: hotel.createdAt.toISOString(),
      updatedAt: hotel.updatedAt.toISOString(),
      Rooms: [
        {
          id: hotelWithRooms.id,
          name: hotelWithRooms.name,
          capacity: hotelWithRooms.capacity,
          hotelId: hotelWithRooms.hotelId,
          createdAt: hotelWithRooms.createdAt.toISOString(),
          updatedAt: hotelWithRooms.updatedAt.toISOString(),
        },
      ],
    });
  });
});
