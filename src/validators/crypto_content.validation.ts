import { Joi } from "express-validation";

const CryptoContentValidation = {
  // POST /lock-content/v1/encrypt
  encrypt: {
    body: Joi.object({
      contentStr: Joi.string().required(),
    }),
  },

  // POST /lock-content/v1/decrypt
  decrypt: {
    body: Joi.object({
      contentStr: Joi.string().required(),
    }),
  },
};

export default CryptoContentValidation;
