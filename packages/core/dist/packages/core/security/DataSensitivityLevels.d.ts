/**
 * Data Sensitivity Levels
 *
 * These levels represent the degree of protection required for different types of data,
 * based on the potential impact of unauthorized disclosure, modification, or destruction.
 */
export declare enum DataSensitivityLevel {
    /**
    * PUBLIC: Information intended for public disclosure,
    * - Can be shared freely without restriction
    * - No confidentiality protection required
    * - Example: Marketing materials, public documentation,
    */
    PUBLIC = "public",
    /**
    * INTERNAL: Information for internal organizational use,
    * - Limited to organization members and authorized partners
    * - Basic access controls required
    * - Example: Internal policies, operational procedures,
    */
    INTERNAL = "internal",
    /**
    * CONFIDENTIAL: Sensitive business information,
    * - Restricted access based on business need
    * - Unauthorized disclosure could harm the organization
    * - Example: Financial data, strategic plans, customer data,
    */
    CONFIDENTIAL = "confidential",
    /**
    * RESTRICTED: Highly sensitive information requiring maximum protection,
    * - Access limited to specific individuals with explicit authorization
    * - Unauthorized disclosure could cause severe harm
    * - Example: Personal data (PII), authentication credentials, trade secrets,
    */
    RESTRICTED = "restricted"
    /**
    * Data handling requirements for each sensitivity level
    */
    ,
    /**
    * Data handling requirements for each sensitivity level
    */
    export,
    interface,
    DataHandlingRequirements
}
//# sourceMappingURL=DataSensitivityLevels.d.ts.map