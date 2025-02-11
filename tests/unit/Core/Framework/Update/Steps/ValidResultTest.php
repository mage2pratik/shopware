<?php declare(strict_types=1);

namespace Shopware\Tests\Unit\Core\Framework\Update\Steps;

use PHPUnit\Framework\TestCase;
use Shopware\Core\Framework\Update\Steps\ValidResult;

/**
 * @internal
 *
 * @covers \Shopware\Core\Framework\Update\Steps\ValidResult
 */
class ValidResultTest extends TestCase
{
    public function testConstructor(): void
    {
        $result = new ValidResult(1, 2);

        static::assertSame(1, $result->getOffset());
        static::assertSame(2, $result->getTotal());
    }
}
