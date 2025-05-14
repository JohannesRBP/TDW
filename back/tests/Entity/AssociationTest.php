<?php
/**
 * tests/Entity/AssociationTest.php
 *
 * @license https://opensource.org/licenses/MIT MIT License
 * @link    https://www.etsisi.upm.es/ ETS de Ingeniería de Sistemas Informáticos
 */

namespace TDW\Test\ACiencia\Entity;

use DateTime;
use Doctrine\Common\Collections\Collection;
use PHPUnit\Framework\Attributes as TestsAttr;
use PHPUnit\Framework\TestCase;
use TDW\ACiencia\Entity\Association;
use TDW\ACiencia\Factory\AssociationFactory;
use TDW\ACiencia\Factory\EntityFactory;

#[TestsAttr\Group('associations')]
#[TestsAttr\CoversClass(Association::class)]
class AssociationTest extends TestCase
{
    protected static Association $association;
    private static \Faker\Generator $faker;

    public static function setUpBeforeClass(): void
    {
        self::$faker = \Faker\Factory::create('es_ES');
        $name = self::$faker->company();
        $websiteUrl = 'https://example.com';
        self::assertNotEmpty($name);
        self::assertNotEmpty($websiteUrl);
        self::$association = AssociationFactory::createAssociation($name, $websiteUrl);
    }

    public function testConstructor(): void
    {
        $name = self::$faker->company();
        $websiteUrl = 'https://example.com';
        $assoc = AssociationFactory::createAssociation($name, $websiteUrl);
        self::assertSame(0, $assoc->getId());
        self::assertSame($name, $assoc->getName());
        self::assertSame($websiteUrl, $assoc->getWebsiteUrl());
        self::assertInstanceOf(Collection::class, $assoc->getEntities());
        self::assertEmpty($assoc->getEntities());
    }

    public function testGetId(): void
    {
        self::assertSame(0, self::$association->getId());
    }

    public function testGetSetAssociationName(): void
    {
        $newName = self::$faker->company();
        self::$association->setName($newName);
        self::assertSame($newName, self::$association->getName());
    }

    public function testGetSetBirthDate(): void
    {
        $birthDate = self::$faker->dateTime();
        self::$association->setBirthDate($birthDate);
        self::assertSame($birthDate, self::$association->getBirthDate());
    }

    public function testGetSetDeathDate(): void
    {
        $deathDate = self::$faker->dateTime();
        self::$association->setDeathDate($deathDate);
        self::assertSame($deathDate, self::$association->getDeathDate());
    }

    public function testGetSetImageUrl(): void
    {
        $imageUrl = self::$faker->url();
        self::$association->setImageUrl($imageUrl);
        self::assertSame($imageUrl, self::$association->getImageUrl());
    }

    public function testGetSetWikiUrl(): void
    {
        $wikiUrl = self::$faker->url();
        self::$association->setWikiUrl($wikiUrl);
        self::assertSame($wikiUrl, self::$association->getWikiUrl());
    }

    public function testGetSetWebsiteUrl(): void
    {
        $newWebsiteUrl = 'https://newexample.com';
        self::$association->setWebsiteUrl($newWebsiteUrl);
        self::assertSame($newWebsiteUrl, self::$association->getWebsiteUrl());
    }

    public function testGetAddContainsRemoveEntities(): void
    {
        
        self::assertEmpty(self::$association->getEntities());
        

        $dummyName = self::$faker->company();
        $dummyEntity = EntityFactory::createElement($dummyName);
        

        self::$association->addEntity($dummyEntity);
        self::$association->addEntity($dummyEntity);
        self::assertNotEmpty(self::$association->getEntities());
        self::assertTrue(self::$association->containsEntity($dummyEntity));

        self::$association->removeEntity($dummyEntity);
        self::assertFalse(self::$association->containsEntity($dummyEntity));
        self::assertCount(0, self::$association->getEntities());
        self::assertFalse(self::$association->removeEntity($dummyEntity));
    }

    public function testToString(): void
    {
    
        $str = self::$association->__toString();
        self::assertStringContainsString(self::$association->getName(), $str);
        self::assertStringContainsString(self::$association->getWebsiteUrl(), $str);
    }

    public function testJsonSerialize(): void
    {
        $json = json_encode(self::$association, JSON_PARTIAL_OUTPUT_ON_ERROR);
        self::assertJson($json);
    }
}
