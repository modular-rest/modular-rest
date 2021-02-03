class BaseResponse {
  bool hasError;
  dynamic error;
  String status;

  BaseResponse(this.hasError, this.error, this.status);
}

class LoginResponse extends BaseResponse {
  String token;

  LoginResponse(bool hasError, dynamic error, String status, this.token)
      : super(hasError, error, status);
}

class ValidateCodeResponse extends BaseResponse {
  bool isValid;

  ValidateCodeResponse(
      bool hasError, dynamic error, String status, this.isValid)
      : super(hasError, error, status);
}
