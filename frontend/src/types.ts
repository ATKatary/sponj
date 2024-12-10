export type themeType = {
    bg: themeEntryType
    font: themeEntryType
}

export type themeEntryType = {
    [key: string]: string
}

export type themeContextType = {
    theme: themeType
    setTheme: (theme: themeType) => void
}

export type loadingType = {
    on?: boolean
    progressText?: string
}