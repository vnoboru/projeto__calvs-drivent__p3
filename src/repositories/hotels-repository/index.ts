import { prisma } from "@/config";

async function getHotels() {
  return await prisma.hotel.findMany();
}

const hotelsRepository = {
  getHotels,
};

export { hotelsRepository };
