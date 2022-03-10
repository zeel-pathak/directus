import { useCollectionsStore, useFieldsStore, useRelationsStore } from '@/stores';
import { Collection, Field, Relation } from '@directus/shared/types';
import { computed, Ref } from 'vue';

export type RelationM2A = {
	allowedCollections: string[];
	collectionField: Field;
	junctionCollection: Collection;
	junctionPrimaryKeyField: Field;
	junctionFields: Field[];
	junction: Relation;
	relation: Relation;
	sortField?: string;
};

export function useRelationM2A(collection: Ref<string>, field: Ref<string>) {
	const relationsStore = useRelationsStore();
	const collectionsStore = useCollectionsStore();
	const fieldsStore = useFieldsStore();

	const relationInfo = computed<RelationM2A | undefined>(() => {
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
			allowedCollections: relation.meta?.one_allowed_collections,
			collectionField: fieldsStore.getField(junction.collection, relation.meta?.one_collection_field as string),
			junctionCollection: collectionsStore.getCollection(junction.collection),
			junctionPrimaryKeyField: fieldsStore.getPrimaryKeyFieldForCollection(junction.collection),
			junctionFields: fieldsStore.getFieldsForCollection(junction.collection),
			junction: junction,
			relation: relation,
			sortField: relation.meta?.sort_field ?? undefined,
		} as RelationM2A;
	});

	return { relationInfo };
}
