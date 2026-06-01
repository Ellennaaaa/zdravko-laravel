<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

/**
 * @OA\Info(
 *     version="1.0.0",
 *     title="Profit First API",
 *     description="API Documentation for Profit First Application",
 *     @OA\Contact(
 *         email="support@example.com"
 *     ),
 *     @OA\License(
 *         name="MIT",
 *         url="https://opensource.org/licenses/MIT"
 *     )
 * )
 *
 * @OA\Server(
 *     url="https://staging.api.profitfirstapp.com",
 *     description="API Server"
 * ),
 * @OA\Server(
 *      url="http://localhost:8000",
 *      description="Local Server"
 *  )
 */
class ApiController extends Controller
{
    protected ApiResponse $apiResponse;

    public function __construct()
    {
        $this->apiResponse = new ApiResponse();
    }
    /**
     * @OA\Get (
     *     path="/api/check",
     *     summary="Check API Status",
     *     description="Check API Status",
     *     operationId="check",
     *     tags={"API"},
     *     @OA\Response(
     *         response=200,
     *         description="API Status",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="success", type="boolean", example="true"),
     *          )
     *     )
     * )
     */
    public function check(): JsonResponse
    {
        return $this->respond();
    }

    /**
     * Respond to client
     *
     * @param array $data
     * @param null $statusCode
     * @return JsonResponse
     */
    public function respond(array $data = [], $statusCode = null): JsonResponse
    {
        return $this->apiResponse->respond($data, $statusCode);
    }

    /**
     * Respond success
     *
     * @param string $status
     * @return JsonResponse
     */
    public function respondSuccess(string $status = "success"): JsonResponse
    {
        $data = ['status' => $status];

        return $this->respond($data);
    }

    /**
     * Respond with Error
     *
     * @param $description
     * @param null $statusCode
     * @return JsonResponse
     */
    public function respondWithError($description, $statusCode = null): JsonResponse
    {
        $statusCode = is_null($statusCode) ? Response::HTTP_BAD_REQUEST : $statusCode;
        return $this->apiResponse
            ->setSuccess(false)
            ->setStatusCode($statusCode)
            ->addError($description)
            ->respond();
    }

    /**
     * Respond with errors where each has message property
     * @param array $errors
     * @param int $code
     * @param array $customFields
     * @return JsonResponse
     */
    public function respondWithErrors(array $errors, int $code = Response::HTTP_BAD_REQUEST, array $customFields = []): JsonResponse
    {
        $response = $this->apiResponse->setSuccess(false);
        foreach ($errors as $error) {
            $response->addError($error['message'], array_intersect_key($error, array_flip($customFields)));
        }

        return $response->setStatusCode($code)->respond();
    }

    /**
     * 401 Unauthorized
     *
     * @param string $message
     * @return JsonResponse
     */
    public function respondUnauthorized(string $message = 'Unauthorized request'): JsonResponse
    {
        return $this->respondWithError($message, Response::HTTP_UNAUTHORIZED);
    }

    /**
     * 404 Not Found
     *
     * @param string $message
     * @return JsonResponse
     */
    public function respondNotFound(string $message = 'Resource not found'): JsonResponse
    {
        return $this->respondWithError($message, Response::HTTP_NOT_FOUND);
    }

    /**
     * 500 Internal Server Error
     *
     * @param string $message
     * @return JsonResponse
     */
    public function respondInternalServerError(string $message = 'Internal Server Error'): JsonResponse
    {
        return $this->respondWithError($message, Response::HTTP_INTERNAL_SERVER_ERROR);
    }

    /**
     * 422 Validation Failed
     *
     * @param array $errors
     * @return JsonResponse
     */
    public function respondValidationFailed(array $errors): JsonResponse
    {
        return $this->apiResponse
            ->setStatusCode(Response::HTTP_UNPROCESSABLE_ENTITY)
            ->addErrors($errors)
            ->setSuccess(false)
            ->respond();
    }
}