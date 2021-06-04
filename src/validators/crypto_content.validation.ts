import { Joi } from "express-validation";

const CryptoContentValidation = {
  // POST /lock-content/v1/encrypt
  encrypt: {
    body: Joi.object({
      contentStr: Joi.string().required(),
    }),
  },
  decrypt: {
    body: Joi.object({
      contentStr: Joi.string().required(),
    }),
  },
};

export default CryptoContentValidation;
