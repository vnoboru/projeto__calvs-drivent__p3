import { notFoundError } from "@/errors";
import { paymentRequired } from "@/errors/payment-error";
import enrollmentRepository from "@/repositories/enrollment-repository";
import { hotelsRepository } from "@/repositories/hotels-repository";
import ticketRepository from "@/repositories/ticket-repository";

async function getHotels(userId: number) {
  await verifyStatusTicket(userId);

  const getHotels = await hotelsRepository.getHotels();

  if (getHotels.length === 0) {
    throw notFoundError();
  }

  return getHotels;
}

async function getHotelsById(userId: number, hotelId: number) {
  await verifyStatusTicket(userId);

  const getRooms = await hotelsRepository.getHotelById(hotelId);

  if (!getRooms) {
    throw notFoundError();
  }

  return getRooms;
}

async function verifyStatusTicket(userId: number) {
  const existEnrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!existEnrollment) {
    throw notFoundError();
  }

  const existPaidTicket = await ticketRepository.findTicketByEnrollmentId(existEnrollment.id);
  if (!existPaidTicket) {
    throw notFoundError();
  }

  if (existPaidTicket.status === "RESERVED") {
    throw paymentRequired();
  }

  if (!existPaidTicket.TicketType.includesHotel || existPaidTicket.TicketType.isRemote) {
    throw paymentRequired();
  }
}

const hotelsService = { getHotels, getHotelsById };

export default hotelsService;
