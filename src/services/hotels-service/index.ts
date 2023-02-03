import { notFoundError, unauthorizedError } from "@/errors";
import { paymentRequired } from "@/errors/payment-error";
import enrollmentRepository from "@/repositories/enrollment-repository";
import { hotelsRepository } from "@/repositories/hotels-repository";
import ticketRepository from "@/repositories/ticket-repository";

async function getHotels(userId: number) {
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

  const getHotels = await hotelsRepository.getHotels();
  return getHotels;
}

const hotelsService = { getHotels };

export default hotelsService;
