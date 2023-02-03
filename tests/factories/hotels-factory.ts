import { prisma } from "@/config";
import { faker } from "@faker-js/faker";

export function createHotel() {
  return prisma.hotel.create({
    data: {
      name: faker.name.fullName(),
      image: faker.image.animals(),
      createdAt: faker.date.between("2022-02-02T00:00:00.000Z", "2022-02-03T00:00:00.000Z"),
      updatedAt: faker.date.between("2022-02-02T00:00:00.000Z", "2022-02-03T00:00:00.000Z"),
    },
  });
}
