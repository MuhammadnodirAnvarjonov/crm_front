<template>
    <div class="yandex-container">
        <yandex-map :settings="settings" :coordinates="coordinates" :detailed-controls="detailedControls"
            :controls="controls" map-type="map" :zoom="zoom" @click="onClick">
            <yandex-marker :coordinates="coordinates" :marker-id="123" />
        </yandex-map>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { YandexMap, YandexMarker } from 'vue-yandex-maps';
import { useI18n } from "vue-i18n";
const { locale } = useI18n()
const props = defineProps(['coordinates'])
const emit = defineEmits(["choose", "address"]);
const controls = ["geolocationControl", "searchControl"];
const detailedControls = { zoomControl: { position: { right: 10, top: 50 } } };
const zoom = 16;
const coordinates = ref([41.2995, 69.2401]);

const settings = ref({
    apiKey: '70747649-067b-4d31-9913-a76fef8faf1d', // Your API key
    lang: locale.value == 'en' ? 'en_US' : locale.value == 'ru' ? 'ru_RU' : 'uz_UZ',
    coordorder: 'latlong',
    enterprise: false,
    version: '2.1'
})

const onClick = (e) => {
    coordinates.value = e.get("coords");
    emit("choose", e.get("coords"));
};
onMounted(() => {
    let element = props.coordinates;
    if (element.update) {
        coordinates.value[0] = element.lat;
        coordinates.value[1] = element.lon;
    }
})
</script>

<style>
.yandex-container {
    height: 600px;
}
</style>