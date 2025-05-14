<?php
/**
 * tests/Controller/Association/AssociationControllerTest.php
 *
 * @license https://opensource.org/licenses/MIT MIT License
 * @link    https://www.etsisi.upm.es/ ETS de Ingeniería de Sistemas Informáticos
 */

namespace TDW\Test\ACiencia\Controller\Association;

use Doctrine\ORM\EntityManagerInterface;
use JsonException;
use PHPUnit\Framework\Attributes as TestsAttr;
use TDW\ACiencia\Controller\Association\{
    AssociationCommandController,
    AssociationQueryController,
    AssociationRelationsController
};
use TDW\ACiencia\Entity\Association;
use TDW\ACiencia\Entity\Entity;
use TDW\ACiencia\Factory\AssociationFactory;
use TDW\ACiencia\Factory\EntityFactory;
use TDW\ACiencia\Utility\{ DoctrineConnector, Utils };
use TDW\Test\ACiencia\Controller\BaseTestCase;

#[TestsAttr\CoversClass(AssociationCommandController::class)]
#[TestsAttr\CoversClass(AssociationQueryController::class)]
#[TestsAttr\CoversClass(AssociationRelationsController::class)]
final class AssociationControllerTest extends BaseTestCase
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

        // Cargar usuario "writer"
        self::$writer = [
            'username' => (string)getenv('ADMIN_USER_NAME'),
            'email'    => (string)getenv('ADMIN_USER_EMAIL'),
            'password' => (string)getenv('ADMIN_USER_PASSWD'),
        ];
        self::$writer['id'] = Utils::loadUserData(
            self::$writer['username'],
            self::$writer['email'],
            self::$writer['password'],
            true
        );

        // Cargar usuario "reader"
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

        // Crear fixture para Association
        $assocName    = self::$faker->company();
        $websiteUrl   = self::$faker->url();
        self::$association = AssociationFactory::createAssociation($assocName, $websiteUrl);

        // Crear fixture para Entity
        $entityName = self::$faker->company();
        self::$entity = EntityFactory::createElement($entityName);

        self::$entityManager = DoctrineConnector::getEntityManager();
        self::$entityManager->persist(self::$association);
        self::$entityManager->persist(self::$entity);
        self::$entityManager->flush();
    }

    /**
     * Test GET /associations/{associationId} con ID inexistente (404 Not Found)
     */
    public function testCGetAssociations404NotFound(): void
    {
        $route = self::RUTA_API . '/999999';
        $response = $this->runApp('GET', $route, null, []);
        self::assertSame(404, $response->getStatusCode());
    }

    /**
     * Test POST /associations (201 Created)
     *
     * Retorna los datos de la Association creada.
     *
     * @return array<string, mixed> Datos de la Association
     */
    #[TestsAttr\Depends('testCGetAssociations404NotFound')]
    public function testPostAssociation201Created(): array
    {
        self::$writer['authHeader'] = $this->getTokenHeaders(
            self::$writer['username'],
            self::$writer['password']
        );
        $data = [
            'name'       => self::$faker->company(),
            'websiteUrl' => self::$faker->url(),
        ];
        $route = self::RUTA_API;
        $response = $this->runApp('POST', $route, $data, self::$writer['authHeader']);
        self::assertSame(201, $response->getStatusCode());
        self::assertNotEmpty($response->getHeader('Location'));
        $body = (string)$response->getBody();
        self::assertJson($body);
        $arr = json_decode($body, true, 512, JSON_THROW_ON_ERROR);
        self::assertArrayHasKey('association', $arr);
        $assoc = $arr['association'];
        self::assertArrayHasKey('id', $assoc);
        self::assertSame($data['name'], $assoc['name']);
        self::assertSame($data['websiteUrl'], $assoc['websiteUrl']);
        return $assoc;
    }

    /**
     * Test POST /associations con datos incompletos => 422 Unprocessable Entity.
     */
    public function testPostAssociation422UnprocessableEntity(): void
    {
        self::$writer['authHeader'] = $this->getTokenHeaders(
            self::$writer['username'],
            self::$writer['password']
        );
        $data = [
            // Falta websiteUrl
            'name' => self::$faker->company(),
        ];
        $route = self::RUTA_API;
        $response = $this->runApp('POST', $route, $data, self::$writer['authHeader']);
        self::assertSame(422, $response->getStatusCode());
    }

    /**
     * Test POST /associations duplicada => 400 Bad Request.
     */
    public function testPostAssociation400BadRequest(): void
    {
        self::$writer['authHeader'] = $this->getTokenHeaders(
            self::$writer['username'],
            self::$writer['password']
        );
        // Intentar crear una association con el mismo nombre y websiteUrl que el fixture ya existente
        $data = [
            'name'       => self::$association->getName(),
            'websiteUrl' => self::$association->getWebsiteUrl(),
        ];
        $route = self::RUTA_API;
        $response = $this->runApp('POST', $route, $data, self::$writer['authHeader']);
        self::assertSame(400, $response->getStatusCode());
    }

    /**
     * Test OPTIONS /associations => 204 No Content.
     */
    public function testOptionsAssociations204NoContent(): void
    {
        $route = self::RUTA_API;
        $response = $this->runApp('OPTIONS', $route, null, []);
        self::assertSame(204, $response->getStatusCode());
        self::assertNotEmpty($response->getHeader('Allow'));
        self::assertEmpty(trim($response->getBody()->getContents()));
    }

    /**
     * Test GET /associations (CGET) 200 OK.
     */
    public function testCGetAssociations200Ok(): void
    {
        self::$reader['authHeader'] = $this->getTokenHeaders(
            self::$reader['username'],
            self::$reader['password']
        );
        $route = self::RUTA_API;
        $response = $this->runApp('GET', $route, null, self::$reader['authHeader']);
        self::assertSame(200, $response->getStatusCode());
        $body = (string)$response->getBody();
        self::assertJson($body);
        $arr = json_decode($body, true, 512, JSON_THROW_ON_ERROR);
        self::assertArrayHasKey('associations', $arr);
    }

    /**
     * Test GET /associations/{associationId} 200 OK.
     *
     * @depends testPostAssociation201Created
     */
    #[TestsAttr\Depends('testPostAssociation201Created')]
    public function testGetAssociation200Ok(array $assoc): void
    {
        $route = self::RUTA_API . '/' . $assoc['id'];
        self::$reader['authHeader'] = $this->getTokenHeaders(
            self::$reader['username'],
            self::$reader['password']
        );
        $response = $this->runApp('GET', $route, null, self::$reader['authHeader']);
        self::assertSame(200, $response->getStatusCode());
        $body = (string)$response->getBody();
        self::assertJson($body);
        $arr = json_decode($body, true, 512, JSON_THROW_ON_ERROR);
        self::assertArrayHasKey('association', $arr);
        self::assertSame($assoc['id'], $arr['association']['id']);
    }


    #[TestsAttr\Depends('testPostAssociation201Created')]
    public function testGetAssociation304NotModified(array $assoc): string
    {
     
        $fullRoute = self::RUTA_API . '/' . $assoc['id'];
        
        self::$reader['authHeader'] = $this->getTokenHeaders(
            self::$reader['username'],
            self::$reader['password']
        );
        
        $response = $this->runApp('GET', $fullRoute, null, self::$reader['authHeader']);
        $etag = trim($response->getHeaderLine('ETag'));
        
        self::assertNotEmpty($etag, 'No se recibió el header ETag en GET.');
        return $etag;
    }


    #[TestsAttr\Depends('testPostAssociation201Created')]
    #[TestsAttr\Depends('testGetAssociation304NotModified')]
    public function testPutAssociation209Updated(array $assoc, string $etag): array
    {
        self::$writer['authHeader'] = $this->getTokenHeaders(
            self::$writer['username'],
            self::$writer['password']
        );
        $u_data = [
            'name'       => 'Asociación Actualizada S.L.',
            'websiteUrl' => 'http://asociacionactualizada.es',
        ];
        $route = self::RUTA_API . '/' . $assoc['id'];
        $headers = array_merge(
            self::$writer['authHeader'],
            [
                'If-Match' => $etag,
                'Content-Type' => 'application/json' // Añadir este header
            ]
        );
        $response = $this->runApp('PUT', $route, $u_data, $headers);
        self::assertSame(209, $response->getStatusCode(), 'Expected 209 Updated.');
        $body = (string)$response->getBody();
        self::assertJson($body);
        $arr = json_decode($body, true, 512, JSON_THROW_ON_ERROR);
        self::assertArrayHasKey('association', $arr);
        $updated = $arr['association'];
        self::assertSame($assoc['id'], $updated['id']);
        self::assertSame($u_data['name'], $updated['name']);
        self::assertSame($u_data['websiteUrl'], $updated['websiteUrl']); // Ahora debe coincidir
        return $updated;
    }

 
    public function testAddEntity209(): void
    {
        self::$writer['authHeader'] = $this->getTokenHeaders(
            self::$writer['username'],
            self::$writer['password']
        );
        $route = self::RUTA_API . '/' . self::$association->getId() . '/entities/add/' . self::$entity->getId();
        $response = $this->runApp('PUT', $route, null, self::$writer['authHeader']);
        self::assertSame(209, $response->getStatusCode());
        self::assertJson($response->getBody()->getContents());
    }

    /**
     * Test GET /associations/{associationId}/entities 200 OK con elementos.
     *
     * @depends testAddEntity209
     * @return void
     * @throws JsonException
     */
    #[TestsAttr\Depends('testAddEntity209')]
    public function testGetAssociationEntities200OkWithElements(): void
    {
        self::$reader['authHeader'] = $this->getTokenHeaders(
            self::$reader['username'],
            self::$reader['password']
        );
        $route = self::RUTA_API . '/' . self::$association->getId() . '/entities';
        $response = $this->runApp('GET', $route, null, self::$reader['authHeader']);
        self::assertSame(200, $response->getStatusCode());
        $body = $response->getBody()->getContents();
        self::assertJson($body);
        $arr = json_decode($body, true, 512, JSON_THROW_ON_ERROR);
        self::assertArrayHasKey('entities', $arr);
        self::assertNotEmpty($arr['entities'], 'La lista de entities no debe estar vacía.');
    }

    /**
     * Test remover la Entity de la Association: PUT /associations/{associationId}/entities/rem/{entityId}
     *
     * @depends testGetAssociationEntities200OkWithElements
     * @return void
     * @throws JsonException
     */
    #[TestsAttr\Depends('testGetAssociationEntities200OkWithElements')]
    public function testRemoveEntity209(): void
    {
        $route = self::RUTA_API . '/' . self::$association->getId() . '/entities/rem/' . self::$entity->getId();
        $response = $this->runApp('PUT', $route, null, self::$writer['authHeader']);
        self::assertSame(209, $response->getStatusCode());
        $body = $response->getBody()->getContents();
        self::assertJson($body);
        $arr = json_decode($body, true, 512, JSON_THROW_ON_ERROR);
        self::assertArrayHasKey('association', $arr);
        self::assertArrayHasKey('entities', $arr['association']);
        self::assertEmpty($arr['association']['entities'], 'La lista de entities debe quedar vacía.');
    }

    /**
     * Test GET /associations/{associationId}/entities 200 OK - Empty.
     *
     * @depends testRemoveEntity209
     * @return void
     * @throws JsonException
     */
    #[TestsAttr\Depends('testRemoveEntity209')]
    public function testGetAssociationEntities200OkEmpty(): void
    {
        $route = self::RUTA_API . '/' . self::$association->getId() . '/entities';
        $response = $this->runApp('GET', $route, null, self::$reader['authHeader']);
        self::assertSame(200, $response->getStatusCode());
        $body = $response->getBody()->getContents();
        self::assertJson($body);
        $arr = json_decode($body, true, 512, JSON_THROW_ON_ERROR);
        self::assertArrayHasKey('entities', $arr);
        self::assertEmpty($arr['entities'], 'Se esperaba que la lista de entities estuviera vacía.');
    }

    /**
     * Data provider para excepciones de rutas (errores).
     *
     * @return array<string, mixed> [ method, url, expected status, user ]
     */
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

    /**
     * Test de errores en las rutas para las relaciones de Association.
     *
     * @param string $method
     * @param string $uri
     * @param int $status
     * @param string $user
     *
     * @return void
     */
    #[TestsAttr\DataProvider('routeExceptionProvider')]
    public function testAssociationRelationshipErrors(string $method, string $uri, int $status, string $user = ''): void
    {
        $requestingUser = match ($user) {
            'admin'  => self::$writer,
            'reader' => self::$reader,
            default  => ['username' => '', 'password' => ''],
        };
        $response = $this->runApp(
            $method,
            $uri,
            null,
            $this->getTokenHeaders($requestingUser['username'], $requestingUser['password'])
        );
        $this->internalTestError($response, $status);
    }
}
