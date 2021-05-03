import { Joi } from "express-validation";

const CommonValidation = {
  // POST /common/v1/check-custom-url-usable
  customUrlRequest: {
    body: Joi.object({
      url: Joi.string().required(),
    }),
  },
};

export default CommonValidation;
