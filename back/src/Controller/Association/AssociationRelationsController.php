<?php
/**
 * src/Controller/Association/AssociationRelationsController.php
 *
 * @license https://opensource.org/licenses/MIT MIT License
 * @link    https://www.etsisi.upm.es/ ETS de Ingeniería de Sistemas Informáticos
 */

namespace TDW\ACiencia\Controller\Association;

use Doctrine\ORM;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Http\Response;
use TDW\ACiencia\Controller\Element\ElementRelationsBaseController;
use TDW\ACiencia\Controller\Entity\EntityQueryController;

final class AssociationRelationsController extends ElementRelationsBaseController
{
    
    public static function getEntityClassName(): string
    {
        return AssociationQueryController::getEntityClassName();
    }

    public static function getEntitiesTag(): string
    {
        return AssociationQueryController::getEntitiesTag();
    }

    public static function getEntityIdName(): string
    {
        return AssociationQueryController::getEntityIdName();
    }

    /**
     * Obtiene las Entidades relacionadas con una Association.
     *
     * GET /associations/{associationId}/entities
     */
    public function getEntities(Request $request, Response $response, array $args): Response
    {
        $associationId = $args[AssociationQueryController::getEntityIdName()] ?? 0;
        if ($associationId <= 0 || $associationId > 2147483647) {
            // Si el ID es inválido, devuelve una lista vacía para la etiqueta de entidades
            return $this->getElements($request, $response, null, EntityQueryController::getEntitiesTag(), []);
        }
        /** @var \TDW\ACiencia\Entity\Association|null $association */
        $association = $this->entityManager
            ->getRepository(AssociationQueryController::getEntityClassName())
            ->find($associationId);

        $entities = $association?->getEntities()->getValues() ?? [];

        return $this->getElements($request, $response, $association, EntityQueryController::getEntitiesTag(), $entities);
    }

    /**
     * Permite (añadir o eliminar) Entidades de una Association.
     *
     * PUT /associations/{associationId}/entities/add/{stuffId}
     * PUT /associations/{associationId}/entities/rem/{stuffId}
     */
    public function operationEntity(Request $request, Response $response, array $args): Response
    {
        return $this->operationRelatedElements(
            $request,
            $response,
            $args,
            EntityQueryController::getEntityClassName()
        );
    }
}
