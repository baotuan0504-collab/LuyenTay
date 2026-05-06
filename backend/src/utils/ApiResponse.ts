export class ApiResponse {
  static success(data: any, message: string = "Success") {
    return {
      success: true,
      message,
      data,
    }
  }

  static error(message: string = "Error", data: any = null) {
    return {
      success: false,
      message,
      data,
    }
  }
}
