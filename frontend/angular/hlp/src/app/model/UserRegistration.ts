interface UserRegistration {
  username: string;
  password: string;
  email: string;
}

interface UserRegistrationResponse {
  id: string;
  username: string;
  registration: Date;
  email: string;
}

export {
  UserRegistration,
  UserRegistrationResponse,
};
