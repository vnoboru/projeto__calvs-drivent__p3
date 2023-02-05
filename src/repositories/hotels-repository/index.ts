import { prisma } from "@/config";

async function getHotels() {
  return await prisma.hotel.findMany();
}

async function getHotelById(hotelId: number) {
  return prisma.hotel.findFirst({
    where: {
      id: hotelId,
    },
    include: {
      Rooms: true,
    },
  });
}

const hotelsRepository = {
  getHotels,
  getHotelById,
};

export { hotelsRepository };
