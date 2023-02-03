import { faker } from "@faker-js/faker";
import { prisma } from "@/config";
import { TicketStatus } from "@prisma/client";

export async function createTicketType(include?: boolean, remote?: boolean) {
  return prisma.ticketType.create({
    data: {
      name: faker.name.fullName(),
      price: faker.datatype.number(),
      isRemote: remote !== undefined ? remote : faker.datatype.boolean(),
      includesHotel: include !== undefined ? include : faker.datatype.boolean(),
    },
  });
}

export async function createTicket(enrollmentId: number, ticketTypeId: number, status: TicketStatus) {
  return prisma.ticket.create({
    data: {
      enrollmentId,
      ticketTypeId,
      status,
    },
  });
}
