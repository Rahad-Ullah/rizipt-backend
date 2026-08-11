import { z } from 'zod';

// create customer validation
const createCustomer = z.object({
  body: z.object({
    name: z.string().nonempty('Name is required'),
    email: z.string().email('Invalid email address'),
  }),
});

// update customer validation
const updateCustomer = z.object({
  body: z.object({
    name: z.string().nonempty('Name cannot be empty').optional(),
    email: z.string().email('Invalid email address').optional(),
  }),
});

export const CustomerValidations = {
  createCustomer,
  updateCustomer,
};
