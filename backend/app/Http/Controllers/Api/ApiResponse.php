<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class ApiResponse extends JsonResponse
{
    protected bool $success;
    protected mixed $data;
    protected string $message;
    protected array $errors = [];

    /**
     * Adds an error to be returned
     *
     * @param string $message
     * @param array $customError
     * @return $this
     */
    public function addError(string $message, array $customError = []): self
    {
        $error = [
            'message' => $message,
            ...$customError,
        ];

        $this->errors[] = $error;

        return $this;
    }

    /**
     * Adds an array of errors to the response
     *
     * @param array $errors Errors to add
     * @return ApiResponse
     */
    public function addErrors(array $errors): self
    {
        foreach ($errors as $error) {
            $this->addError($error ?? '');
        }

        return $this;
    }

    /**
     * Builds the response to be returned to the client
     *
     * @param array $data Array of data to send back optionally
     * @param integer|null $statusCode HTTP status code
     * @return JsonResponse
     */
    public function respond(array $data = [], int $statusCode = NULL): JsonResponse
    {
        if (!isset($this->success)) {
            $this->setSuccess(true);
        }
        // StatusCode passed in? Set it
        if (!is_null($statusCode)) {
            $this->setStatusCode($statusCode);
        }
        if (!empty($data)) {
            $this->data = $data;
        }
        // Check if a status code has been set. We NEED one of these, and we want to force the dev to give us one
        if (($this->getStatusCode() == Response::HTTP_OK) && (!empty($this->getErrors())) && $this->success) {
            abort(500, 'Response can not have status code of 200 and contain errors at the same time.');
        }
        // Build the returning array
        $responseArray = [];
        if (!empty($this->errors)) {
            $responseArray['errors'] = $this->errors;
            $this->setSuccess(false);
        } else {
            $responseArray = $data;
        }
        $responseArray['success'] = $this->success;
        $this->setStatusCode($this->statusCode);
        $this->setContent(json_encode($responseArray));
        
        return $this;
    }

    public function getErrors(): array
    {
        return $this->errors;
    }

    public function setSuccess(bool $success): self
    {
        $this->success = $success;

        return $this;
    }
}