<?php declare(strict_types=1);

namespace Shopware\Core\Framework\App\Manifest\Xml\ShippingMethod;

use Shopware\Core\Checkout\Shipping\ShippingMethodEntity;
use Shopware\Core\Framework\App\Manifest\Xml\XmlElement;
use Shopware\Core\Framework\Log\Package;
use Symfony\Component\Config\Util\XmlUtils;

/**
 * @internal only for use by the app-system
 */
#[Package('core')]
class ShippingMethod extends XmlElement
{
    final public const TRANSLATABLE_FIELDS = ['name', 'description', 'tracking-url'];

    final public const REQUIRED_FIELDS = [
        'identifier',
        'name',
        'deliveryTime',
    ];

    protected string $identifier;

    /**
     * @var array<string, string>
     */
    protected array $name;

    /**
     * @var array<string, string>
     */
    protected array $description = [];

    protected ?string $icon = null;

    protected int $position = ShippingMethodEntity::POSITION_DEFAULT;

    /**
     * @var array<string, string>
     */
    protected array $trackingUrl = [];

    protected DeliveryTime $deliveryTime;

    /**
     * @param array<int|string, string|array<string, string>> $data
     */
    private function __construct(array $data)
    {
        $this->validateRequiredElements($data, self::REQUIRED_FIELDS);

        foreach ($data as $property => $value) {
            $this->$property = $value;
        }
    }

    public static function fromXml(\DOMElement $element): self
    {
        return new self(self::parse($element));
    }

    public function toArray(string $defaultLocale): array
    {
        $data = parent::toArray($defaultLocale);

        foreach (self::TRANSLATABLE_FIELDS as $TRANSLATABLE_FIELD) {
            $translatableField = self::kebabCaseToCamelCase($TRANSLATABLE_FIELD);

            $data[$translatableField] = $this->ensureTranslationForDefaultLanguageExist(
                $data[$translatableField],
                $defaultLocale
            );
        }

        $data['appShippingMethod'] = [
            'identifier' => $data['identifier'],
        ];

        unset($data['identifier']);

        if (\array_key_exists('deliveryTime', $data) && $data['deliveryTime'] instanceof DeliveryTime) {
            $data['deliveryTime'] = $data['deliveryTime']->toArray($defaultLocale);
        }

        return $data;
    }

    public function getIdentifier(): string
    {
        return $this->identifier;
    }

    /**
     * @return array<string, string>
     */
    public function getName(): array
    {
        return $this->name;
    }

    /**
     * @return array<string, string>
     */
    public function getDescription(): array
    {
        return $this->description;
    }

    public function getIcon(): ?string
    {
        return $this->icon;
    }

    public function getPosition(): int
    {
        return $this->position;
    }

    /**
     * @return array<string, string>
     */
    public function getTrackingUrl(): array
    {
        return $this->trackingUrl;
    }

    public function getDeliveryTime(): DeliveryTime
    {
        return $this->deliveryTime;
    }

    /**
     * @return array<int|string, string|array<string, string>>
     */
    private static function parse(\DOMElement $element): array
    {
        $values = [];

        foreach ($element->childNodes as $child) {
            if (!$child instanceof \DOMElement) {
                continue;
            }

            if (\in_array($child->tagName, self::TRANSLATABLE_FIELDS, true)) {
                $values = self::mapTranslatedTag($child, $values);

                continue;
            }

            if ($child->tagName === 'delivery-time') {
                $values[self::kebabCaseToCamelCase($child->tagName)] = DeliveryTime::fromXml($child);

                continue;
            }

            $values[self::kebabCaseToCamelCase($child->tagName)] = XmlUtils::phpize($child->nodeValue ?? '');
        }

        return $values;
    }
}
