/**
 * Authentication endpoints, cookie policy, and return schemas are not specified
 * by the project proposal. Never fake success or store passwords in the browser.
 */
export async function signIn(_credentials) {
  throw new Error('로그인 API가 아직 정해지지 않았습니다. 현재는 데모 입장만 이용할 수 있습니다.');
}

export async function signUp(_payload) {
  throw new Error('회원가입 API가 아직 정해지지 않았습니다. 백엔드 연동 후 이용할 수 있습니다.');
}
