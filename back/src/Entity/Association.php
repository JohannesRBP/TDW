<?php

/**
 * src/Entity/Association.php
 *
 * Clase que representa una Asociación de entidades
 *
 * @license https://opensource.org/licenses/MIT MIT License
 * @link    https://www.etsisi.upm.es/ ETS de Ingeniería de Sistemas Informáticos
 */

 namespace TDW\ACiencia\Entity;

 use DateTime;
 use Doctrine\Common\Collections\{ ArrayCollection, Collection };
 use Doctrine\ORM\Mapping as ORM;
 use JetBrains\PhpStorm\ArrayShape;
 use ReflectionObject;
 

#[ORM\Entity]
#[ORM\Table(name: "associations")]
#[ORM\UniqueConstraint(name: "Association_name_uindex", columns: ["name"])]
class Association extends Element
{
    /**
     * websiteUrl (no puede ser null)
     *
     * @var string
     */
    #[ORM\Column(
        name: "website_url",
        type: "string",
        length: 2047,
        nullable: false
    )]
    protected string $websiteUrl;

    /**
     * Conjunto de entidades que forman parte de esta asociación
     *
     * @var Collection<Entity>
     */
    #[ORM\ManyToMany(targetEntity: Entity::class, inversedBy: "associations")]
    #[ORM\JoinTable(name: "entity_belongs_asociacion",joinColumns: [new ORM\JoinColumn(name: "association_id", referencedColumnName: "id")],
        inverseJoinColumns: [new ORM\JoinColumn(name: "entity_id", referencedColumnName: "id")]
    )]
    protected Collection $entities;

    /**
     * Constructor 
     *
     * Solo es obligatorio name y websiteUrl 
     *
     * @param string $name       Nombre de la asociación (not null)
     * @param string $websiteUrl URL del sitio web (not null)
     */

    public function __construct(
        string $name,
        string $websiteUrl,
        ?DateTime $birthDate = null,
        ?DateTime $deathDate = null,
        ?string $imageUrl = null,
        ?string $wikiUrl = null,
    ) {
        parent::__construct($name, $birthDate, $deathDate, $imageUrl, $wikiUrl);
        $this->websiteUrl = $websiteUrl;
        $this->entities = new ArrayCollection();
    }
    
    /**
     * Obtiene todas las entidades que forman parte de esta asociación
     *
     * @return Collection<Entity>
     */
    public function getEntities(): Collection
    {
        return $this->entities;
    }

    /**
     * Comprueba si una entidad es miembro de esta asociación
     *
     * @param Entity $entity Entidad a comprobar
     * @return bool Verdadero si la entidad ya está en la colección
     */
    public function containsEntity(Entity $entity): bool
    {
        return $this->entities->contains($entity);
    }

    /**
     * Añade una entidad a esta asociación si no está ya incluida
     *
     * @param Entity $entity Entidad a añadir
     */
    public function addEntity(Entity $entity): void
    {
        if (! $this->containsEntity($entity)) {
            $this->entities->add($entity);
        }
    }

     
    /**
     * Elimina una entidad de esta asociación
     *
     * @param Entity $entity Entidad a eliminar
     * @return bool Verdadero si la entidad estaba y se eliminó
     */
    public function removeEntity(Entity $entity): bool
    {
        return $this->entities->removeElement($entity);
    }


    /**
     * Devuelve la URL del sitio web de la asociación
     *
     * @return string URL no vacía
     */
    public function getWebsiteUrl(): string
    {
        return $this->websiteUrl;
    }

    /**
     * Actualiza la URL del sitio web de la asociación
     *
     * @param string $websiteUrl Nueva URL (no vacía)
     */
    public function setWebsiteUrl(string $websiteUrl): void
    {
        assert($websiteUrl !== '');
        $this->websiteUrl = $websiteUrl;
    }

   
    /**
     * Representación en string de la asociación
     *
     * @return string 
     */
    public function __toString(): string
    {
        return sprintf(
            '%s, websiteUrl="%s", entities=%s]',
            parent::__toString(),
            $this->getWebsiteUrl(),
            $this->getCodesStr($this->getEntities())
        );
    }

    /**
     * Serialización a JSON de la asociación
     *
     * @see \JsonSerializable
     */
    #[ArrayShape(["association" => "array|mixed"])]
    public function jsonSerialize(): mixed
    {
        $reflection = new ReflectionObject($this);
        $data = parent::jsonSerialize();
        $data['websiteUrl'] = $this->websiteUrl;
        $entities = $this->getEntities();
        $data['entities'] = $entities->isEmpty()
            ? []
            : $this->getCodes($entities);

        return [strtolower($reflection->getShortName()) => $data];
    }
}
