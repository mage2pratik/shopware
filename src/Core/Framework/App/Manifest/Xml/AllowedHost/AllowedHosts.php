<?php declare(strict_types=1);

namespace Shopware\Core\Framework\App\Manifest\Xml\AllowedHost;

use Shopware\Core\Framework\App\Manifest\Xml\XmlElement;
use Shopware\Core\Framework\Log\Package;

/**
 * @internal only for use by the app-system
 */
#[Package('core')]
class AllowedHosts extends XmlElement
{
    private function __construct(protected array $allowedHosts)
    {
    }

    public static function fromXml(\DOMElement $element): self
    {
        return new self(self::parseAllowedHosts($element));
    }

    public static function fromArray(array $allowedHosts): self
    {
        return new self($allowedHosts);
    }

    public function getHosts(): array
    {
        return $this->allowedHosts;
    }

    private static function parseAllowedHosts(\DOMElement $element): array
    {
        $allowedHosts = [];

        foreach ($element->childNodes as $child) {
            if (!$child instanceof \DOMElement) {
                continue;
            }

            $allowedHosts[] = $child->nodeValue;
        }

        return $allowedHosts;
    }
}
