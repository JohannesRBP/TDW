<?php

/**
 * src/Controller/Entity/EntityRelationsController.php
 *
 * @license https://opensource.org/licenses/MIT MIT License
 * @link    https://www.etsisi.upm.es/ ETS de Ingeniería de Sistemas Informáticos
 */

namespace TDW\ACiencia\Controller\Entity;

use Doctrine\ORM;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Http\Response;
use TDW\ACiencia\Controller\Element\ElementRelationsBaseController;
use TDW\ACiencia\Controller\Person\PersonQueryController;
use TDW\ACiencia\Controller\Product\ProductQueryController;
use TDW\ACiencia\Controller\Entity\EntityQueryController;
use TDW\ACiencia\Entity\Entity;
use TDW\ACiencia\Entity\Person;
use TDW\ACiencia\Entity\Product;
use TDW\ACiencia\Entity\Association;


/**
 * Class EntityRelationsController
 */
final class EntityRelationsController extends ElementRelationsBaseController
{
    public static function getEntityClassName(): string
    {
        return EntityQueryController::getEntityClassName();
    }

    public static function getEntitiesTag(): string
    {
        return EntityQueryController::getEntitiesTag();
    }

    public static function getEntityIdName(): string
    {
        return EntityQueryController::getEntityIdName();
    }

    /**
     * Summary: GET /entities/{entityId}/persons
     *
     * @param Request $request
     * @param Response $response
     * @param array<string,mixed> $args
     *
     * @return Response
     */
    public function getPersons(Request $request, Response $response, array $args): Response
    {
        // @TODO
        $id     = (int) $args[static::getEntityIdName()];
        $entity = $this->entityManager
            ->getRepository(static::getEntityClassName())
            ->find($id);
        $items  = $entity instanceof Entity
            ? $entity->getPersons()->toArray()
            : [];
        return $this->getElements(
            $request,
            $response,
            $entity,
            'persons',
            $items
        );
    }

    /**
     * PUT /entities/{entityId}/persons/add/{elementId}
     * PUT /entities/{entityId}/persons/rem/{elementId}
     *
     * @param Request $request
     * @param Response $response
     * @param array<string,mixed> $args
     *
     * @return Response
     * @throws ORM\Exception\ORMException
     */
    public function operationPerson(Request $request, Response $response, array $args): Response
    {
        // @TODO
        return $this->operationRelatedElements(
            $request,
            $response,
            $args,
            Person::class
        );
    }

    /**
     * Summary: GET /entities/{entityId}/products
     *
     * @param Request $request
     * @param Response $response
     * @param array<string,mixed> $args
     *
     * @return Response
     */
    public function getProducts(Request $request, Response $response, array $args): Response
    {
        // @TODO
        $id     = (int) $args[static::getEntityIdName()];
        $entity = $this->entityManager
            ->getRepository(static::getEntityClassName())
            ->find($id);
        $items  = $entity instanceof Entity
            ? $entity->getProducts()->toArray()
            : [];
        return $this->getElements(
            $request,
            $response,
            $entity,
            'products',
            $items
        );
    }

    /**
     * PUT /entities/{entityId}/products/add/{elementId}
     * PUT /entities/{entityId}/products/rem/{elementId}
     *
     * @param Request $request
     * @param Response $response
     * @param array<string,mixed> $args
     *
     * @return Response
     * @throws ORM\Exception\ORMException
     */
    public function operationProduct(Request $request, Response $response, array $args): Response
    {
        // @TODO
        return $this->operationRelatedElements(
            $request,
            $response,
            $args,
            Product::class
        );
    }



    /**
     * Summary: GET /entities/{entityId}/associations
     *
     * @param Request $request
     * @param Response $response
     * @param array<string,mixed> $args
     *
     * @return Response
     */
    public function getAssociations(Request $request, Response $response, array $args): Response
    {
        $id     = (int) $args[static::getEntityIdName()];
        $entity = $this->entityManager
            ->getRepository(static::getEntityClassName())
            ->find($id);
        $items  = $entity instanceof Entity
            ? $entity->getAssociations()->toArray()
            : [];

        return $this->getElements(
            $request,
            $response,
            $entity,
            'associations',
            $items
        );
}

    /**
     * PUT /entities/{entityId}/associations/add/{elementId}
     * PUT /entities/{entityId}/associations/rem/{elementId}
     *
     * @param Request $request
     * @param Response $response
     * @param array<string,mixed> $args
     *
     * @return Response
     * @throws ORM\Exception\ORMException
     */
    public function operationAssociation(Request $request, Response $response, array $args): Response
    {
        return $this->operationRelatedElements(
            $request,
            $response,
            $args,
            Association::class
        );
    }
}