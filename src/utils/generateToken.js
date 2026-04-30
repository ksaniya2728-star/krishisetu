import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  console.log('Generating token with secret:', process.env.JWT_SECRET ? '***set***' : '***NOT SET***');
  return jwt.sign({ id: id.toString() }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

export default generateToken;