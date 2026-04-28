import addressServices from "../services/addressServices.js";
import { createAddressSchema, updateAddressSchema } from "../validators/addressValidators.js";
import { idParamsSchema } from "../validators/globalValidators.js";

class AddressControllers {
  async getAddresses(req, res, next) {
    try {
      const addresses = await addressServices.getAddresses(req.user.id);

      res.status(200).json({ addresses });
    } catch (error) {
      next(error);
    }
  }

  async getAddressById(req, res, next) {
    try {
      const validation = idParamsSchema.safeParse({ id: req.params.id });

      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }

      const address = await addressServices.getAddressById(validation.data.id, req.user.id, req.user.role);

      res.status(200).json({ address });
    } catch (error) {
      next(error);
    }
  }

  async createAddress(req, res, next) {
    try {
      const validation = createAddressSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }

      const address = await addressServices.createAddress(req.user.id, validation.data);

      res.status(201).json({ message: "Endereço criado com sucesso.", address });
    } catch (error) {
      next(error);
    }
  }

  async updateAddress(req, res, next) {
    try {
      const validationId = idParamsSchema.safeParse({ id: req.params.id });
      const validation = updateAddressSchema.safeParse(req.body);

      if (!validationId.success) {
        return res.status(400).json({ error: validationId.error.format() });
      }

      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }

      const address = await addressServices.updateAddress(validationId.data.id, req.user.id, validation.data);

      res.status(200).json({ message: "Endereço atualizado com sucesso.", address });
    } catch (error) {
      next(error);
    }
  }

  async deleteAddress(req, res, next) {
    try {
      const validation = idParamsSchema.safeParse({ id: req.params.id });

      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }

      await addressServices.deleteAddress(validation.data.id, req.user.id);

      res.status(200).json({ message: "Endereço removido com sucesso." });
    } catch (error) {
      next(error);
    }
  }
}

export default new AddressControllers();
