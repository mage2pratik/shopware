import { shallowMount } from '@vue/test-utils';
import swCustomerAddressForm from 'src/module/sw-customer/component/sw-customer-address-form';
import ShopwareError from 'src/core/data/ShopwareError';
import 'src/app/component/form/sw-text-field';
import 'src/app/component/form/field-base/sw-contextual-field';
import 'src/app/component/form/field-base/sw-block-field';
import 'src/app/component/form/field-base/sw-base-field';
import 'src/app/component/form/field-base/sw-field-error';

// eslint-disable-next-line import/named
import CUSTOMER from '../../constant/sw-customer.constant';

/**
 * @package customer-order
 */

Shopware.Component.register('sw-customer-address-form', swCustomerAddressForm);

async function createWrapper() {
    const responses = global.repositoryFactoryMock.responses;

    responses.addResponse({
        method: 'Post',
        url: '/search/country',
        status: 200,
        response: {
            data: [
                {
                    id: 'bc05040b-9da1-41ec-93ad-add9d33cd731',
                    attributes: {
                        id: '3a2e625b-f5e1-46d8-9e76-68c0e9b672a1'
                    }
                }
            ]
        }
    });

    return shallowMount(await Shopware.Component.build('sw-customer-address-form'), {
        propsData: {
            customer: {},
            address: {
                _isNew: true,
                id: '1',
                getEntityName: () => { return 'customer_address'; },
            }
        },
        stubs: {
            'sw-container': true,
            'sw-text-field': await Shopware.Component.build('sw-text-field'),
            'sw-contextual-field': await Shopware.Component.build('sw-contextual-field'),
            'sw-block-field': await Shopware.Component.build('sw-block-field'),
            'sw-base-field': await Shopware.Component.build('sw-base-field'),
            'sw-field-error': await Shopware.Component.build('sw-field-error'),
            'sw-entity-single-select': true,
            'sw-icon': true,
        },
        provide: {
            validationService: {},
            repositoryFactory: {
                create: (entity) => {
                    if (entity === 'country') {
                        return {
                            get: (id) => {
                                if (id) {
                                    return Promise.resolve({
                                        id,
                                        name: 'Germany'
                                    });
                                }

                                return Promise.resolve({});
                            }
                        };
                    }

                    return {
                        search: (criteria = {}) => {
                            const countryIdFilter = criteria?.filters.find(item => item.field === 'countryId');

                            if (countryIdFilter?.value === '1') {
                                return Promise.resolve([{
                                    id: 'state1'
                                }]);
                            }
                            return Promise.resolve([]);
                        }
                    };
                },
            },
        }
    });
}

describe('module/sw-customer/page/sw-customer-address-form', () => {
    it('should exclude the default salutation from selectable salutations', async () => {
        const wrapper = await createWrapper();
        const criteria = wrapper.vm.salutationCriteria;
        const expectedCriteria = { type: 'not', operator: 'or', queries: [{ field: 'id', type: 'equals', value: 'ed643807c9f84cc8b50132ea3ccb1c3b' }] };

        expect(criteria.filters).toContainEqual(expectedCriteria);
    });

    it('should hide state field if country dont have states', async () => {
        const wrapper = await createWrapper();

        await wrapper.setProps({
            address: {
                countryId: '2'
            }
        });

        await wrapper.vm.$nextTick();

        const stateSelect = wrapper.find('.sw-customer-address-form__state-select');
        expect(stateSelect.exists()).toBeFalsy();
    });

    it('should show state field if country has states', async () => {
        const wrapper = await createWrapper();

        await wrapper.setProps({
            address: {
                countryId: '1'
            }
        });

        await wrapper.vm.$nextTick();

        const stateSelect = wrapper.find('.sw-customer-address-form__state-select');
        expect(stateSelect.exists()).toBeTruthy();
    });

    it('should mark company as required field when switching to business type', async () => {
        const wrapper = await createWrapper();
        await wrapper.setProps({
            customer: {
                accountType: CUSTOMER.ACCOUNT_TYPE_BUSINESS,
            },
            address: {}
        });

        expect(wrapper.find('[label="sw-customer.addressForm.labelCompany"]')
            .attributes('required')).toBeTruthy();
    });

    it('should not mark company as required when switching to private type', async () => {
        const wrapper = await createWrapper();
        await wrapper.setProps({
            customer: {
                accountType: CUSTOMER.ACCOUNT_TYPE_PRIVATE,
            }
        });

        expect(wrapper.find('[label="sw-customer.addressForm.labelCompany"]')
            .attributes('required')).toBeFalsy();
    });

    it('should display company, department and vat fields by default when account type is empty', async () => {
        const wrapper = await createWrapper();
        await wrapper.setProps({
            customer: {
                company: 'shopware',
            },
            address: {},
        });

        expect(wrapper.find('[label="sw-customer.addressForm.labelCompany"]').exists()).toBeTruthy();
        expect(wrapper.find('[label="sw-customer.addressForm.labelDepartment"]').exists()).toBeTruthy();
    });

    it('should hide the error field when a disabled field', async () => {
        await Shopware.State.dispatch('error/addApiError', {
            expression: 'customer_address.1.firstName',
            error: new ShopwareError({
                code: 'c1051bb4-d103-4f74-8988-acbcafc7fdc3',
                detail: 'This value should not be blank.',
                status: '400',
                template: 'This value should not be blank.',
                selfLink: 'customer_address.1.firstName',
            }),
        });

        const wrapper = await createWrapper();

        await wrapper.vm.$nextTick();

        const firstName = wrapper.findAll('.sw-field').at(3);

        expect(wrapper.vm.disabled).toBe(false);
        expect(firstName.classes().includes('has--error')).toBe(true);
        expect(firstName.find('.sw-field__error').text()).toEqual('This value should not be blank.');

        await wrapper.setProps({ disabled: true });
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.disabled).toBe(true);
        expect(firstName.classes().includes('has--error')).toBe(false);
        expect(firstName.find('.sw-field__error').exists()).toBeFalsy();
    });
});
