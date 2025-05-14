<?php
/**
 * src/Factory/AssociationFactory.php
 *
 * @license https://opensource.org/licenses/MIT MIT License
 * @link    https://www.etsisi.upm.es/ ETS de Ingeniería de Sistemas Informáticos
 */

namespace TDW\ACiencia\Factory;

use DateTime;
use TDW\ACiencia\Entity\Association;

class AssociationFactory extends ElementFactory
{
    /**
     * Crea una Association con websiteUrl.
     */
    public static function createAssociation(
        string $name,
        string $websiteUrl,
        ?DateTime $birthDate = null,
        ?DateTime $deathDate = null,
        ?string $imageUrl = null,
        ?string $wikiUrl = null
    ): Association {
        return new Association($name, $websiteUrl, $birthDate, $deathDate, $imageUrl, $wikiUrl);
    }
    

    public static function createElement(
        string $name,
        ?DateTime $birthDate = null,
        ?DateTime $deathDate = null,
        ?string $imageUrl = null,
        ?string $wikiUrl = null
    ): Association {
        return self::createAssociation($name, 'http://default.url', $birthDate, $deathDate, $imageUrl, $wikiUrl);
    }
}
