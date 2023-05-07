<?php
/**
 * @author      Open Source Team
 * @copyright   2023 Pagar.me (https://pagar.me)
 * @license     https://pagar.me Copyright
 *
 * @link        https://pagar.me
 */

declare(strict_types=1);

namespace Pagarme\Pagarme\Model\ResourceModel;

use Magento\Framework\Model\ResourceModel\Db\AbstractDb;
use Pagarme\Pagarme\Api\Data\CustomerInterface;

/**
 * Class Customer
 * @package Pagarme\Pagarme\Model\ResourceModel
 */
class Customer extends AbstractDb
{
    /** @var string */
    const TABLE = 'pagarme_module_core_customer';

    /** @var string */
    const ENTITY_ID = CustomerInterface::ENTITY_ID;

    /**
     * @return void
     */
    protected function _construct(): void
    {
        $this->_init(self::TABLE, self::ENTITY_ID);
    }
}
