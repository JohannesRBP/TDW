<?php
/**
 * src/Controller/Association/AssociationCommandController.php
 *
 * @license https://opensource.org/licenses/MIT MIT License
 * @link    https://www.etsisi.upm.es/ ETS de Ingeniería de Sistemas Informáticos
 */

namespace TDW\ACiencia\Controller\Association;

use TDW\ACiencia\Controller\Element\ElementBaseCommandController;
use TDW\ACiencia\Entity\Association;
use TDW\ACiencia\Factory\AssociationFactory;
use TDW\ACiencia\Entity\ElementInterface;

class AssociationCommandController extends ElementBaseCommandController
{

    public const PATH_ASSOCIATIONS = '/associations';

  
    public static function getEntityClassName(): string
    {
        return Association::class;
    }

  
    protected static function getFactoryClassName(): string
    {
        return AssociationFactory::class;
    }

  
    public static function getEntityIdName(): string
    {
        return 'associationId';
    }

    /**
     * 
     * Obliga a que se envíen "name" y "websiteUrl".
     *
     * @param array<string,string> $data
     * @return ElementInterface
     * @throws \InvalidArgumentException si faltan parámetros obligatorios.
     */
    protected function createElementFromData(array $data): ElementInterface
    {
        if (!isset($data['name']) || !isset($data['websiteUrl'])) {
            throw new \InvalidArgumentException('Faltan parámetros obligatorios: name y websiteUrl.');
        }
        return AssociationFactory::createAssociation($data['name'], $data['websiteUrl']);
    }

    /**
     * 
     * Llama al método del padre y luego actualiza websiteUrl.
     *
     * @param mixed $element
     * @param array<string,string> $data
     */
    protected function updateElement($element, array $data): void
    {
        parent::updateElement($element, $data);
        
        // Actualiza websiteUrl si se envía en el request
        if (isset($data['websiteUrl'])) {
            $element->setWebsiteUrl($data['websiteUrl']);
        }
    }
}
