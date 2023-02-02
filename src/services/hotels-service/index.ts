import { notFoundError } from "@/errors";
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
    throw { name: "name: PaymentRequiredError" };
  }

  const result = await ticketRepository.findTicketTypeWithId(existPaidTicket.ticketTypeId);
  if (!result.includesHotel || result.isRemote) {
    throw { name: "name: PaymentRequiredError" };
  }

  const getHotels = await hotelsRepository.getHotels();
  return getHotels;
}

const hotelsService = { getHotels };

export default hotelsService;
