<script setup>
defineProps({
    title: String,
    value: [String, Number],
    icon: String,
    color: String
})
</script>

<template>
    <div class="glass-panel stat-card">
        <div class="icon-wrapper" :class="color">
            <span class="icon">{{ icon }}</span>
        </div>
        <div class="content">
            <h3>{{ value }}</h3>
            <p>{{ title }}</p>
        </div>
    </div>
</template>

<style scoped>
.stat-card {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 1.5rem;
}

.icon-wrapper {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
}

.icon-wrapper.primary { background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(99, 102, 241, 0.1)); color: #818cf8; }
.icon-wrapper.secondary { background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(6, 182, 212, 0.1)); color: #22d3ee; }
.icon-wrapper.accent { background: linear-gradient(135deg, rgba(244, 63, 94, 0.2), rgba(244, 63, 94, 0.1)); color: #fb7185; }

.content h3 {
    font-size: 1.8rem;
    margin: 0;
    font-weight: 700;
}

.content p {
    margin: 0;
    color: var(--text-muted);
    font-size: 0.9rem;
}
</style>
