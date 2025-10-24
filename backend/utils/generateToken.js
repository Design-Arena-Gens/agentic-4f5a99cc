import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production', {
    expiresIn: '30d'
  });
};

export default generateToken;
