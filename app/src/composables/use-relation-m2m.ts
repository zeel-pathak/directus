import { useCollectionsStore, useFieldsStore, useRelationsStore } from '@/stores';
import { Collection, Field, Relation } from '@directus/shared/types';
import { computed, Ref } from 'vue';

export type RelationM2M = {
	relation: Relation;
	relatedCollection: Collection;
	relatedPrimaryKeyField: Field;
	junctionCollection: Collection;
	junctionPrimaryKeyField: Field;
	junctionFields: Field[];
	junction: Relation;
	sortField?: string;
};

export function useRelationM2M(collection: Ref<string>, field: Ref<string>) {
	const relationsStore = useRelationsStore();
	const collectionsStore = useCollectionsStore();
	const fieldsStore = useFieldsStore();

	const relationInfo = computed<RelationM2M | undefined>(() => {
		const relations = relationsStore.getRelationsForField(collection.value, field.value);

		const junction = relations.find(
			(relation) =>
				relation.related_collection === collection.value &&
				relation.meta?.one_field === field.value &&
				relation.meta.junction_field
		);

		if (!junction) return undefined;

		const relation = relations.find(
			(relation) => relation.collection === junction.collection && relation.field === junction.meta?.junction_field
		);

		if (!relation) return undefined;

		return {
			relation: relation,
			relatedCollection: collectionsStore.getCollection(relation.related_collection as string),
			relatedPrimaryKeyField: fieldsStore.getPrimaryKeyFieldForCollection(relation.related_collection as string),
			sortField: relation.meta?.sort_field ?? undefined,
			junctionCollection: collectionsStore.getCollection(junction.collection),
			junctionPrimaryKeyField: fieldsStore.getPrimaryKeyFieldForCollection(junction.collection),
			junctionFields: fieldsStore.getFieldsForCollection(junction.collection),
			junction: junction,
		} as RelationM2M;
	});

	return { relationInfo };
}
