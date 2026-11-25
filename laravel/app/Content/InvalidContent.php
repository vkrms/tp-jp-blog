<?php

namespace App\Content;

use RuntimeException;

/** Content failed validation; nothing was saved. */
class InvalidContent extends RuntimeException
{
    /** @param string[] $errors */
    public function __construct(public readonly array $errors)
    {
        parent::__construct('Content is invalid: '.implode('; ', $errors));
    }
}
