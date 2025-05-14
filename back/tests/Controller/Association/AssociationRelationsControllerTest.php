<?php

namespace TDW\Test\ACiencia\Controller\Association;

use Doctrine\ORM\EntityManagerInterface;
use JsonException;
use PHPUnit\Framework\Attributes as TestsAttr;
use TDW\ACiencia\Controller\Element\ElementRelationsBaseController;
use TDW\ACiencia\Controller\Association\{ AssociationQueryController, AssociationRelationsController };
use TDW\ACiencia\Entity\{ Association, Entity };
use TDW\ACiencia\Factory\{ AssociationFactory, EntityFactory };
use TDW\ACiencia\Utility\{ DoctrineConnector, Utils };
use TDW\Test\ACiencia\Controller\BaseTestCase;

#[TestsAttr\CoversClass(AssociationRelationsController::class)]
#[TestsAttr\CoversClass(ElementRelationsBaseController::class)]
final class AssociationRelationsControllerTest extends BaseTestCase
{
    protected const RUTA_API = '/api/v1/associations';

    protected static array $writer;

    protected static array $reader;

    protected static ?EntityManagerInterface $entityManager;

    private static Association $association;
    private static Entity $entity;

    public static function setUpBeforeClass(): void
    {
        parent::setUpBeforeClass();

        self::$writer = [
            'username' => (string) getenv('ADMIN_USER_NAME'),
            'email'    => (string) getenv('ADMIN_USER_EMAIL'),
            'password' => (string) getenv('ADMIN_USER_PASSWD'),
        ];

        self::$writer['id'] = Utils::loadUserData(
            self::$writer['username'],
            self::$writer['email'],
            self::$writer['password'],
            true
        );

        self::$reader = [
            'username' => self::$faker->userName(),
            'email'    => self::$faker->email(),
            'password' => self::$faker->password(),
        ];
        self::$reader['id'] = Utils::loadUserData(
            self::$reader['username'],
            self::$reader['email'],
            self::$reader['password'],
            false
        );

        $associationName = self::$faker->company();
        self::$association = AssociationFactory::createAssociation($associationName, self::$faker->url());

        $entityName = self::$faker->company();
        self::$entity = EntityFactory::createElement($entityName);

        self::$entityManager = DoctrineConnector::getEntityManager();
        self::$entityManager->persist(self::$association);
        self::$entityManager->persist(self::$entity);
        self::$entityManager->flush();
    }

    public function testGetEntitiesTag(): void
    {
        self::assertSame(
            AssociationQueryController::getEntitiesTag(),
            AssociationRelationsController::getEntitiesTag()
        );
    }

    // *******************
    // Association -> Entities
    // *******************
    public function testOptionsRelationship204(): void
    {
        $response = $this->runApp(
            'OPTIONS',
            self::RUTA_API . '/' . self::$association->getId() . '/entities'
        );
        self::assertSame(204, $response->getStatusCode());
        self::assertNotEmpty($response->getHeader('Allow'));
        self::assertEmpty($response->getBody()->getContents());

        $response = $this->runApp(
            'OPTIONS',
            self::RUTA_API . '/' . self::$association->getId() 
            . '/entities/add/' . self::$entity->getId()
        );
        self::assertSame(204, $response->getStatusCode());
        self::assertNotEmpty($response->getHeader('Allow'));
        self::assertEmpty($response->getBody()->getContents());
    }

    public function testAddEntity209(): void
    {
        self::$writer['authHeader'] = $this->getTokenHeaders(
            self::$writer['username'],
            self::$writer['password']
        );
        $response = $this->runApp(
            'PUT',
            self::RUTA_API . '/' . self::$association->getId() 
                . '/entities/add/' . self::$entity->getId(),
            null,
            self::$writer['authHeader']
        );
        self::assertSame(209, $response->getStatusCode());
        self::assertJson($response->getBody()->getContents());
    }

    #[TestsAttr\Depends('testAddEntity209')]
    public function testGetEntities200OkWithElements(): void
    {
        self::$reader['authHeader'] = $this->getTokenHeaders(
            self::$reader['username'],
            self::$reader['password']
        );
        $response = $this->runApp(
            'GET',
            self::RUTA_API . '/' . self::$association->getId() . '/entities',
            null,
            self::$reader['authHeader']
        );
        self::assertSame(200, $response->getStatusCode());
        $r_body = $response->getBody()->getContents();
        self::assertJson($r_body);
        $responseEntities = json_decode($r_body, true, 512, JSON_THROW_ON_ERROR);
        self::assertArrayHasKey('entities', $responseEntities);
        self::assertSame(
            self::$entity->getName(),
            $responseEntities['entities'][0]['entity']['name']
        );
    }

    #[TestsAttr\Depends('testGetEntities200OkWithElements')]
    public function testRemoveEntity209(): void
    {
        $response = $this->runApp(
            'PUT',
            self::RUTA_API . '/' . self::$association->getId()
            . '/entities/rem/' . self::$entity->getId(),
            null,
            self::$writer['authHeader']
        );
        self::assertSame(209, $response->getStatusCode());
        $r_body = $response->getBody()->getContents();
        self::assertJson($r_body);
        $responseProduct = json_decode($r_body, true, 512, JSON_THROW_ON_ERROR);
        self::assertArrayHasKey('entities', $responseProduct['association']);
        self::assertEmpty($responseProduct['association']['entities']);
    }

    #[TestsAttr\Depends('testRemoveEntity209')]
    public function testGetEntities200OkEmpty(): void
    {
        $response = $this->runApp(
            'GET',
            self::RUTA_API . '/' . self::$association->getId() . '/entities',
            null,
            self::$reader['authHeader']
        );
        self::assertSame(200, $response->getStatusCode());
        $r_body = $response->getBody()->getContents();
        self::assertJson($r_body);
        $responseEntities = json_decode($r_body, true, 512, JSON_THROW_ON_ERROR);
        self::assertArrayHasKey('entities', $responseEntities);
        self::assertEmpty($responseEntities['entities']);
    }

    /**
     * @param string $method
     * @param string $uri
     * @param int $status
     * @param string $user
     */
    #[TestsAttr\DataProvider('routeExceptionProvider')]
    public function testAssociationRelationshipErrors(string $method, string $uri, int $status, string $user = ''): void
    {
        $requestingUser = match ($user) {
            'admin'  => self::$writer,
            'reader' => self::$reader,
            default  => ['username' => '', 'password' => '']
        };

        $response = $this->runApp(
            $method,
            $uri,
            null,
            $this->getTokenHeaders($requestingUser['username'], $requestingUser['password'])
        );
        $this->internalTestError($response, $status);
    }

    public static function routeExceptionProvider(): array
    {
        return [
            // 401
            'putAddEntity401'    => ['PUT', self::RUTA_API . '/1/entities/add/1', 401],
            'putRemoveEntity401' => ['PUT', self::RUTA_API . '/1/entities/rem/1', 401],
            
            // 403
            'putAddEntity403'    => ['PUT', self::RUTA_API . '/1/entities/add/1', 403, 'reader'],
            'putRemoveEntity403' => ['PUT', self::RUTA_API . '/1/entities/rem/1', 403, 'reader'],
            
            // 404
            'getEntities404'     => ['GET', self::RUTA_API . '/0/entities', 404, 'admin'],
            'putAddEntity404'    => ['PUT', self::RUTA_API . '/0/entities/add/1', 404, 'admin'],
            'putRemoveEntity404' => ['PUT', self::RUTA_API . '/0/entities/rem/1', 404, 'admin'],
            
            // 406
            'putAddEntity406'    => ['PUT', self::RUTA_API . '/1/entities/add/100', 406, 'admin'],
            'putRemoveEntity406' => ['PUT', self::RUTA_API . '/1/entities/rem/100', 406, 'admin'],
        ];
    }
}