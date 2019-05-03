module.exports = class User {
  static createUserQuery(email, username, password, sign_up_date) {
    return `
    INSERT INTO User (
      email, 
      username,
      password,
      sign_up_date
    ) VALUES (
        '${email}', 
        '${username}',
        '${password}', 
        ${sign_up_date}
    );`;
  }

  static findUserQuery(email) {
    return `
    SELECT 
        email,
        username,
        password
    FROM User
    WHERE   email LIKE '${email}';`;
  }
};
