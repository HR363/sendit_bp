BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Parcel] ALTER COLUMN [senderId] NVARCHAR(1000) NULL;
ALTER TABLE [dbo].[Parcel] ALTER COLUMN [receiverId] NVARCHAR(1000) NULL;
ALTER TABLE [dbo].[Parcel] ALTER COLUMN [categoryId] NVARCHAR(1000) NULL;

-- CreateTable
CREATE TABLE [dbo].[PickupRequest] (
    [id] NVARCHAR(1000) NOT NULL,
    [requesterId] NVARCHAR(1000) NOT NULL,
    [assignedCourierId] NVARCHAR(1000),
    [parcelDetails] NVARCHAR(1000) NOT NULL,
    [pickupLocation] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [PickupRequest_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [completedAt] DATETIME2,
    CONSTRAINT [PickupRequest_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[PickupRequest] ADD CONSTRAINT [PickupRequest_requesterId_fkey] FOREIGN KEY ([requesterId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PickupRequest] ADD CONSTRAINT [PickupRequest_assignedCourierId_fkey] FOREIGN KEY ([assignedCourierId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
